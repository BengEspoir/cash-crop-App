/**
 * Multi-provider email service
 * Supports SendGrid, Mailgun, and SMTP (fallback)
 */

const env = require('../../config/env');

// Send via SendGrid
const sendViaSendGrid = async ({ to, subject, html }) => {
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(env.SENDGRID_API_KEY);
  
  const msg = {
    to,
    from: env.EMAIL_FROM,
    subject,
    html,
  };
  
  const response = await sgMail.send(msg);
  return {
    success: true,
    provider: 'sendgrid',
    messageId: response[0]?.headers['x-message-id']
  };
};

// Send via Mailgun
const sendViaMailgun = async ({ to, subject, html }) => {
  const formData = new (require('form-data'))();
  formData.append('from', env.EMAIL_FROM);
  formData.append('to', to);
  formData.append('subject', subject);
  formData.append('html', html);
  
  const response = await fetch(
    `https://api.mailgun.net/v3/${env.MAILGUN_DOMAIN}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`api:${env.MAILGUN_API_KEY}`).toString('base64'),
      },
      body: formData
    }
  );
  
  if (!response.ok) {
    throw new Error(`Mailgun error: ${response.statusText}`);
  }
  
  const data = await response.json();
  return {
    success: true,
    provider: 'mailgun',
    messageId: data.id
  };
};

// Send via SMTP (nodemailer)
const sendViaSmtp = async ({ to, subject, html }) => {
  const nodemailer = require('nodemailer');
  
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });
  
  const info = await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    html
  });
  
  return {
    success: true,
    provider: 'smtp',
    messageId: info.messageId
  };
};

// Main send function with fallback
const sendEmail = async ({ to, subject, html, devHints }) => {
  // Development fallback
  if (!env.SENDGRID_API_KEY && !env.MAILGUN_API_KEY && !env.SMTP_USER) {
    if (env.ALLOW_DEV_DELIVERY_FALLBACK) {
      return {
        success: true,
        delivered: false,
        provider: 'development-fallback',
        devHints: env.EXPOSE_DEV_AUTH_HINTS ? devHints : null
      };
    }
    throw new Error('No email provider configured');
  }

  const providers = [
    { name: 'sendgrid', enabled: !!env.SENDGRID_API_KEY, send: sendViaSendGrid },
    { name: 'mailgun', enabled: !!env.MAILGUN_API_KEY, send: sendViaMailgun },
    { name: 'smtp', enabled: !!env.SMTP_USER, send: sendViaSmtp }
  ].filter(p => p.enabled);

  // Try configured provider first, then fallbacks
  const configuredProvider = providers.find(p => p.name === (env.EMAIL_PROVIDER || 'smtp')) || providers[0];
  const fallbackProviders = providers.filter(p => p.name !== configuredProvider.name);

  try {
    const result = await configuredProvider.send({ to, subject, html });
    return {
      ...result,
      devHints: env.EXPOSE_DEV_AUTH_HINTS ? devHints : null
    };
  } catch (error) {
    // Try fallbacks
    for (const provider of fallbackProviders) {
      try {
        const result = await provider.send({ to, subject, html });
        return {
          ...result,
          fallback: true,
          originalError: error.message,
          devHints: env.EXPOSE_DEV_AUTH_HINTS ? devHints : null
        };
      } catch (fallbackError) {
        continue;
      }
    }

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
  sendViaSendGrid,
  sendViaMailgun,
  sendViaSmtp
};
