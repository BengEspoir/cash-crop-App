const mockTurnstileEnv = {
  TURNSTILE_ENABLED: true,
  TURNSTILE_SECRET_KEY: 'secret',
  TURNSTILE_ALLOWED_HOSTNAMES: ['agriculnet.farm'],
  TURNSTILE_VERIFY_URL: 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
};

jest.mock('../config/env', () => mockTurnstileEnv);

const { verifyTurnstile } = require('./turnstile');

const run = async (body, result) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => result
  });
  const req = { body: { ...body }, ip: '127.0.0.1' };
  const next = jest.fn();
  await verifyTurnstile('login')(req, {}, next);
  return { req, next };
};

describe('verifyTurnstile', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('requires a token when enabled', async () => {
    const { next } = await run({}, {});
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 400,
      errorCode: 'BOT_PROTECTION_REQUIRED'
    }));
  });

  test('accepts matching success, hostname, and action without retaining the token', async () => {
    const { req, next } = await run(
      { turnstileToken: 'one-time-token' },
      { success: true, hostname: 'agriculnet.farm', action: 'login' }
    );
    expect(next).toHaveBeenCalledWith();
    expect(req.body.turnstileToken).toBeUndefined();
    expect(req.botProtection).toEqual(expect.objectContaining({ verified: true, action: 'login' }));
  });

  test.each([
    [{ success: false, hostname: 'agriculnet.farm', action: 'login' }, 'failed validation'],
    [{ success: true, hostname: 'evil.example', action: 'login' }, 'wrong hostname'],
    [{ success: true, hostname: 'agriculnet.farm', action: 'register' }, 'wrong action']
  ])('rejects %s (%s)', async (result) => {
    const { next } = await run({ turnstileToken: 'one-time-token' }, result);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 400,
      errorCode: 'BOT_PROTECTION_FAILED'
    }));
  });
});
