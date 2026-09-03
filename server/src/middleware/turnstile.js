const env = require('../config/env');
const AppError = require('../utils/AppError');

const verifyTurnstile = (expectedAction) => async (req, _res, next) => {
  const token = req.body?.turnstileToken;
  if (req.body) delete req.body.turnstileToken;
  if (!env.TURNSTILE_ENABLED) return next();
  if (!token || typeof token !== 'string') {
    return next(new AppError('Complete the bot-protection check and try again', 400, 'BOT_PROTECTION_REQUIRED'));
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const form = new URLSearchParams({
      secret: env.TURNSTILE_SECRET_KEY,
      response: token,
    });
    if (req.ip) form.set('remoteip', req.ip);
    const response = await fetch(env.TURNSTILE_VERIFY_URL, {
      method: 'POST',
      body: form,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    if (!response.ok) {
      throw new AppError('Bot-protection service is temporarily unavailable', 503, 'BOT_PROTECTION_UNAVAILABLE');
    }
    const result = await response.json();
    const hostnameAllowed = !env.TURNSTILE_ALLOWED_HOSTNAMES.length ||
      env.TURNSTILE_ALLOWED_HOSTNAMES.includes(result.hostname);
    if (!result.success || result.action !== expectedAction || !hostnameAllowed) {
      throw new AppError('Bot-protection verification failed. Please try again.', 400, 'BOT_PROTECTION_FAILED');
    }
    req.botProtection = {
      verified: true,
      action: expectedAction,
      hostname: result.hostname
    };
    return next();
  } catch (error) {
    if (error instanceof AppError) return next(error);
    return next(new AppError('Bot-protection service is temporarily unavailable', 503, 'BOT_PROTECTION_UNAVAILABLE'));
  } finally {
    clearTimeout(timeout);
  }
};

module.exports = { verifyTurnstile };
