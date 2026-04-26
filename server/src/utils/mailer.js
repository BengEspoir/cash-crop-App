const { sendEmail } = require('./email/index');
const env = require('../config/env');

const sendEmailWithDevHints = async ({ to, subject, html, devHints }) => {
  return sendEmail({ to, subject, html, devHints });
};

const sendVerificationEmail = async (email, firstName, verifyLink) => {
  const html = `
    <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1A6B3C 0%, #0D3D22 100%); padding: 30px; text-align: center;">
        <h1 style="color: #E8B84B; margin: 0; font-family: 'DM Serif Display', serif;">AgriculNet</h1>
      </div>
      <div style="padding: 30px; background: #fff;">
        <h2 style="color: #111827;">Hello ${firstName},</h2>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Thank you for joining AgriculNet. Please click the button below to verify your email address.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyLink}" style="background: #1A6B3C; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #6B7280; font-size: 14px;">This link expires in 24 hours.</p>
        <p style="color: #6B7280; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
      </div>
    </div>
  `;

  return sendEmailWithDevHints({
    to: email,
    subject: 'Verify your AgriculNet email address',
    html,
    devHints: {
      verificationEmail: email,
      verificationLink: verifyLink
    }
  });
};

const sendPasswordResetEmail = async (email, firstName, resetLink) => {
  const html = `
    <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1A6B3C 0%, #0D3D22 100%); padding: 30px; text-align: center;">
        <h1 style="color: #E8B84B; margin: 0; font-family: 'DM Serif Display', serif;">AgriculNet</h1>
      </div>
      <div style="padding: 30px; background: #fff;">
        <h2 style="color: #111827;">Hello ${firstName},</h2>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          We received a request to reset your AgriculNet password. Click the button below to reset it.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background: #1A6B3C; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #6B7280; font-size: 14px;">This link expires in 1 hour.</p>
        <p style="color: #6B7280; font-size: 14px;">If you didn't request this, you can safely ignore this email. Your password remains unchanged.</p>
      </div>
    </div>
  `;

  return sendEmailWithDevHints({
    to: email,
    subject: 'Reset your AgriculNet password',
    html,
    devHints: {
      passwordResetEmail: email,
      passwordResetLink: resetLink
    }
  });
};

const sendWelcomeEmail = async (email, firstName, role) => {
  let roleMessage = '';
  if (role === 'farmer') {
    roleMessage = 'You can now list your crops, manage orders, and connect with buyers worldwide.';
  } else if (role.includes('buyer')) {
    roleMessage = 'You can now browse available crops, connect with farmers, and place orders.';
  } else {
    roleMessage = 'Your account is now active and ready to use.';
  }

  const html = `
    <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1A6B3C 0%, #0D3D22 100%); padding: 30px; text-align: center;">
        <h1 style="color: #E8B84B; margin: 0; font-family: 'DM Serif Display', serif;">AgriculNet</h1>
      </div>
      <div style="padding: 30px; background: #fff;">
        <h2 style="color: #111827;">Welcome to AgriculNet, ${firstName}!</h2>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          ${roleMessage}
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${env.CLIENT_URL}/dashboard" style="background: #1A6B3C; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
        <p style="color: #6B7280; font-size: 14px;">Thank you for joining the AgriculNet community.</p>
      </div>
    </div>
  `;

  return sendEmailWithDevHints({
    to: email,
    subject: `Welcome to AgriculNet, ${firstName}!`,
    html,
    devHints: {
      welcomeEmail: email,
      dashboardLink: `${env.CLIENT_URL}/dashboard`
    }
  });
};

const sendAccountApprovedEmail = async (email, firstName, role) => {
  let roleText = '';
  let dashboardUrl = env.CLIENT_URL;
  
  if (role === 'farmer') {
    roleText = 'Your farmer profile is now visible to buyers worldwide.';
    dashboardUrl = `${env.CLIENT_URL}/farmer/dashboard`;
  } else if (role.includes('buyer')) {
    roleText = 'You can now browse verified crop listings and connect with farmers.';
    dashboardUrl = `${env.CLIENT_URL}/buyer/dashboard`;
  }

  const html = `
    <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1A6B3C 0%, #0D3D22 100%); padding: 30px; text-align: center;">
        <h1 style="color: #E8B84B; margin: 0; font-family: 'DM Serif Display', serif;">AgriculNet</h1>
      </div>
      <div style="padding: 30px; background: #fff;">
        <h2 style="color: #111827;">Welcome, ${firstName}!</h2>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Great news! Your AgriculNet account has been approved and activated. ${roleText}
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${env.CLIENT_URL}/sign-in" style="background: #1A6B3C; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
            Sign In to Your Account
          </a>
        </div>
        <p style="color: #374151; font-size: 14px; line-height: 1.6;">
          Sign in with your email or phone number and the password you created during registration.
        </p>
        <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">
          If you have any questions, our support team is here to help.
        </p>
      </div>
    </div>
  `;

  return sendEmailWithDevHints({
    to: email,
    subject: 'Your AgriculNet account is now active!',
    html,
    devHints: {
      approvedEmail: email,
      signInLink: `${env.CLIENT_URL}/sign-in`
    }
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendAccountApprovedEmail
};
