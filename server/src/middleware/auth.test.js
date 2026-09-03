const { ERROR_CODES } = require('../config/constants');
const { requireDashboardAccess, requireMarketplaceAccess } = require('./auth');

const createResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis()
});

describe('phone verification access policy', () => {
  test('allows an email-verified user to load dashboard data without phone verification', () => {
    const req = { user: { email_verified: true, phone_verified: false } };
    const res = createResponse();
    const next = jest.fn();

    requireDashboardAccess(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('blocks a marketplace mutation until phone verification is completed', () => {
    const req = { user: { email_verified: true, phone_verified: false } };
    const res = createResponse();
    const next = jest.fn();

    requireMarketplaceAccess(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: { code: ERROR_CODES.PHONE_NOT_VERIFIED }
    }));
  });

  test('allows marketplace mutations after phone verification', () => {
    const req = { user: { email_verified: true, phone_verified: true } };
    const res = createResponse();
    const next = jest.fn();

    requireMarketplaceAccess(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('does not require seller identity verification for marketplace access', () => {
    const req = { user: { status: 'active', email_verified: true, phone_verified: true } };
    const res = createResponse();
    const next = jest.fn();

    requireMarketplaceAccess(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
