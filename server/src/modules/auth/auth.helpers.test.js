const { USER_STATUS } = require('../../config/constants');
const { getNextStep } = require('./auth.helpers');

describe('auth next-step policy', () => {
  test('does not force an email-verified buyer into phone verification at login', () => {
    expect(getNextStep({
      role: 'local_buyer',
      email_verified: true,
      phone_verified: false,
      status: USER_STATUS.PENDING_VERIFICATION
    })).toBe('dashboard');
  });

  test('allows an unverified seller into the workspace before a marketplace action', () => {
    expect(getNextStep({
      role: 'farmer',
      email_verified: true,
      phone_verified: false,
      status: USER_STATUS.PENDING_VERIFICATION
    })).toBe('dashboard');
  });

  test('continues a seller to identity verification after phone verification', () => {
    expect(getNextStep({
      role: 'farmer',
      email_verified: true,
      phone_verified: true,
      status: USER_STATUS.PENDING_IDENTITY_VERIFICATION
    })).toBe('verify_identity');
  });
});
