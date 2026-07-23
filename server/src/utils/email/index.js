/**
 * Resend-backed email delivery for verification and account mail.
 * Development still falls back to in-app hints when no live provider is configured.
 */

const env = require('../../config/env');

const RESEND_API_BASE = 'https://api.resend.com';

const isResendConfigured = () => Boolean(env.RESEND_API_KEY);

const sendViaResend = async ({ to, subject, html }) => {
  const response = await fetch(`${RESEND_API_BASE}/emails`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      html
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || `Resend request failed with status ${response.status}`);
  }

  return {
    success: true,
    delivered: true,
    provider: 'resend',
    messageId: payload?.id || null
  };
};

const sendEmail = async ({ to, subject, html, devHints }) => {
  if (!isResendConfigured()) {
    if (env.ALLOW_DEV_DELIVERY_FALLBACK) {
      return {
        success: true,
        delivered: false,
        provider: 'development-fallback',
        devHints: env.EXPOSE_DEV_AUTH_HINTS ? devHints : null
      };
    }

    throw new Error('No Resend API key configured');
  }

  try {
    const result = await sendViaResend({ to, subject, html });
    return {
      ...result,
      devHints: env.EXPOSE_DEV_AUTH_HINTS ? devHints : null
    };
  } catch (error) {
    if (env.ALLOW_DEV_DELIVERY_FALLBACK) {
      return {
        success: true,
        delivered: false,
        provider: 'development-fallback',
        error: error.message,
        devHints: env.EXPOSE_DEV_AUTH_HINTS ? devHints : null
      };
    }

    throw error;
  }
};

module.exports = {
  sendEmail,
  sendViaResend
};
