const { USER_STATUS } = require('../../config/constants');
const { getNextStep, normalizePhone, isPhone } = require('./auth.helpers');

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

describe('international phone normalization', () => {
  test.each([
    ['6 00 00 00 00', 'CM', '+237600000000'],
    ['202-555-0123', 'US', '+12025550123'],
    ['020 7946 0958', 'GB', '+442079460958'],
    ['01 42 68 53 00', 'FR', '+33142685300'],
    ['0802 123 4567', 'NG', '+2348021234567'],
    ['024 123 4567', 'GH', '+233241234567'],
    ['416 555 0123', 'CA', '+14165550123']
  ])('normalizes %s for %s', (value, country, expected) => {
    expect(normalizePhone(value, country)).toBe(expected);
    expect(isPhone(expected)).toBe(true);
  });

  test('keeps legacy Cameroon forms compatible', () => {
    expect(normalizePhone('237600000000')).toBe('+237600000000');
    expect(normalizePhone('+237600000000')).toBe('+237600000000');
  });
});
