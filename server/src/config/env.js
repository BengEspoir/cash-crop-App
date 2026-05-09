require('dotenv').config({ quiet: true });

const isProduction = process.env.NODE_ENV === 'production';
const required = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET'
];

if (isProduction) {
  required.push(
    'SUPABASE_SERVICE_ROLE_KEY',
    'SMTP_USER',
    'SMTP_PASS',
    'AT_API_KEY',
    'AT_USERNAME'
  );
}

const missing = required.filter(key => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

const parseBooleanEnv = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  return !['false', '0', 'no', 'off'].includes(String(value).trim().toLowerCase());
};

const allowDevDeliveryFallback = !isProduction && parseBooleanEnv(process.env.ALLOW_DEV_DELIVERY_FALLBACK, true);
const exposeDevAuthHints = !isProduction && parseBooleanEnv(process.env.EXPOSE_DEV_AUTH_HINTS, true);
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  (!isProduction ? process.env.SUPABASE_ANON_KEY : undefined);

module.exports = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  API_VERSION: process.env.API_VERSION || 'v1',
  BASE_URL: process.env.BASE_URL || 'http://localhost:5000',

  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey,

  // JWT
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || '15m',
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || '30d',

  // Bcrypt
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,

  // Email
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || 'smtp',
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'AgriculNet <no-reply@agriculnet.cm>',
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',
  MAILGUN_API_KEY: process.env.MAILGUN_API_KEY || '',
  MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN || '',

  // SMS
  SMS_PRIMARY_PROVIDER: process.env.SMS_PRIMARY_PROVIDER || 'africastalking',
  AT_API_KEY: process.env.AT_API_KEY || '',
  AT_USERNAME: process.env.AT_USERNAME || '',
  AT_SENDER_ID: process.env.AT_SENDER_ID === undefined ? '' : process.env.AT_SENDER_ID.trim(),
  AT_SANDBOX: parseBooleanEnv(process.env.AT_SANDBOX, true),
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '',

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  // Private verification storage
  SUPABASE_VERIFICATION_BUCKET: process.env.SUPABASE_VERIFICATION_BUCKET || 'farmer-verifications',

  // OTP
  OTP_LENGTH: parseInt(process.env.OTP_LENGTH, 10) || 6,
  OTP_EXPIRES_MINUTES: parseInt(process.env.OTP_EXPIRES_MINUTES, 10) || 10,
  OTP_MAX_ATTEMPTS: parseInt(process.env.OTP_MAX_ATTEMPTS, 10) || 3,

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  AUTH_RATE_LIMIT_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 10,

  // Client URLs
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  EMAIL_VERIFY_URL: process.env.EMAIL_VERIFY_URL || 'http://localhost:3000/verify-email',
  PASSWORD_RESET_URL: process.env.PASSWORD_RESET_URL || 'http://localhost:3000/reset-password',

  // Admin
  ADMIN_ROUTE_SECRET: process.env.ADMIN_ROUTE_SECRET || '',

  // Development helpers
  ALLOW_DEV_DELIVERY_FALLBACK: allowDevDeliveryFallback,
  EXPOSE_DEV_AUTH_HINTS: exposeDevAuthHints
};
