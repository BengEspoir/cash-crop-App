const mockSingle = jest.fn();
let mockUserStatus = 'active';
const mockFrom = jest.fn(() => ({
  select: jest.fn(() => ({
    eq: jest.fn(() => ({ single: mockSingle })),
    in: jest.fn().mockImplementation(() => Promise.resolve({
      data: [{ id: 'seller-1', status: mockUserStatus, role: 'farmer' }],
      error: null
    }))
  }))
}));

jest.mock('../../config/supabase', () => ({
  supabaseAdmin: { from: mockFrom }
}));

const { ensureFarmerCanReceiveCommerce } = require('./orders.service');

describe('seller commerce eligibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUserStatus = 'active';
  });

  test('allows an active seller before identity verification', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { id: 'seller-1', status: 'active', role: 'farmer' },
      error: null
    });

    await expect(ensureFarmerCanReceiveCommerce({ user_id: 'seller-1' }))
      .resolves.toMatchObject({ status: 'active' });
  });

  test.each(['suspended', 'deactivated'])('blocks a %s seller', async (status) => {
    mockUserStatus = status;
    mockSingle.mockResolvedValueOnce({
      data: { id: 'seller-1', status, role: 'farmer' },
      error: null
    });

    await expect(ensureFarmerCanReceiveCommerce({ user_id: 'seller-1' }))
      .rejects.toMatchObject({ statusCode: 403 });
  });
});