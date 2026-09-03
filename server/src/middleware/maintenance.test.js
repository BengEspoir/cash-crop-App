const mockGetMaintenanceState = jest.fn();

jest.mock('../modules/system/system.repository', () => ({ getMaintenanceState: mockGetMaintenanceState }));
jest.mock('../utils/logger', () => ({ error: jest.fn() }));

const { maintenanceGuard, clearMaintenanceCache } = require('./maintenance');

const response = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('maintenanceGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearMaintenanceCache();
  });

  test('does not query state for read requests', async () => {
    const next = jest.fn();
    await maintenanceGuard({ method: 'GET', path: '/api/v1/listings' }, response(), next);
    expect(next).toHaveBeenCalled();
    expect(mockGetMaintenanceState).not.toHaveBeenCalled();
  });

  test('blocks normal writes with a stable 503 error code', async () => {
    mockGetMaintenanceState.mockResolvedValue({
      maintenance_enabled: true,
      maintenance_message: 'Scheduled work',
      maintenance_started_at: '2026-09-02T10:00:00.000Z'
    });
    const res = response();
    const next = jest.fn();
    await maintenanceGuard({ method: 'POST', path: '/api/v1/payments/id/release' }, res, next);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: expect.objectContaining({ code: 'SYSTEM_MAINTENANCE' })
    }));
    expect(next).not.toHaveBeenCalled();
  });

  test('keeps admin maintenance controls and auth available', async () => {
    const next = jest.fn();
    await maintenanceGuard({ method: 'POST', path: '/api/v1/admin/maintenance/disable' }, response(), next);
    await maintenanceGuard({ method: 'POST', path: '/api/v1/auth/login/phone' }, response(), next);
    expect(next).toHaveBeenCalledTimes(2);
    expect(mockGetMaintenanceState).not.toHaveBeenCalled();
  });

  test('allows writes when maintenance is disabled', async () => {
    mockGetMaintenanceState.mockResolvedValue({ maintenance_enabled: false });
    const next = jest.fn();
    await maintenanceGuard({ method: 'PATCH', path: '/api/v1/listings/id' }, response(), next);
    expect(next).toHaveBeenCalled();
  });
});
