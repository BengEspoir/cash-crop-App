const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    error: { code: 'RATE_LIMITED' }
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.AUTH_RATE_LIMIT_MAX,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    error: { code: 'RATE_LIMITED' }
  }
});

const otpSendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: 'Too many OTP requests, please try again later',
    error: { code: 'RATE_LIMITED' }
  }
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again later',
    error: { code: 'RATE_LIMITED' }
  }
});

const aiChatLimiter = rateLimit({
  windowMs: env.AI_RATE_LIMIT_WINDOW_MS,
  max: env.AI_RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many AI assistant requests, please try again later',
    error: { code: 'AI_RATE_LIMITED' }
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  otpSendLimiter,
  passwordResetLimiter,
  aiChatLimiter
};
