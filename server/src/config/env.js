require('dotenv').config({ quiet: true });

const isProduction = process.env.NODE_ENV === 'production';
const smsPrimaryProvider = String(process.env.SMS_PRIMARY_PROVIDER || 'africastalking').trim().toLowerCase();
const required = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY'
];

if (isProduction) {
  required.push(
    'SUPABASE_SERVICE_ROLE_KEY',
    'RESEND_API_KEY',
    'FAPSHI_API_USER',
    'FAPSHI_API_KEY',
    'FAPSHI_WEBHOOK_SECRET'
  );

  if (smsPrimaryProvider === 'twilio') {
    required.push('TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN');
  } else {
    required.push('AT_API_KEY', 'AT_USERNAME');
  }
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

const parseListEnv = (value, defaultValue = '') =>
  String(value === undefined || value === null ? defaultValue : value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

const normalizeTestPhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  return digits ? `+${digits}` : '';
};

const parseSmsTestOtp = (value) => {
  if (!value) return {};

  let entries;
  try {
    entries = Object.entries(JSON.parse(value));
  } catch {
    entries = String(value)
      .split(',')
      .map(entry => entry.split('='))
      .filter(parts => parts.length === 2);
  }

  return Object.fromEntries(entries
    .map(([phone, otp]) => [normalizeTestPhone(phone), String(otp || '').trim()])
    .filter(([phone, otp]) => phone && /^\d{6}$/.test(otp)));
};

const parseFixedOtp = (value) => {
  const otp = String(value || '').trim();
  return /^d{6}$/.test(otp) ? otp : '';
};

const parseBoundedIntegerEnv = (value, defaultValue, min, max) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return defaultValue;
  return Math.min(max, Math.max(min, parsed));
};

// Keep the whole provider chain below the client's 50-second request timeout.
const aiRequestTimeoutMs = parseBoundedIntegerEnv(
  process.env.AI_REQUEST_TIMEOUT_MS,
  45 * 1000,
  5 * 1000,
  45 * 1000
);
const aiProviderTimeoutMs = Math.min(
  parseBoundedIntegerEnv(process.env.AI_PROVIDER_TIMEOUT_MS, 10 * 1000, 1000, 15 * 1000),
  aiRequestTimeoutMs
);

const allowDevDeliveryFallback = !isProduction && parseBooleanEnv(process.env.ALLOW_DEV_DELIVERY_FALLBACK, true);
const exposeDevAuthHints = !isProduction && parseBooleanEnv(process.env.EXPOSE_DEV_AUTH_HINTS, true);
const turnstileEnabled = parseBooleanEnv(process.env.TURNSTILE_ENABLED, false);
const databaseBackupEnabled = parseBooleanEnv(process.env.DATABASE_BACKUP_ENABLED, false);
const databaseRestoreEnabled = parseBooleanEnv(process.env.DATABASE_RESTORE_ENABLED, false);
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  (!isProduction ? process.env.SUPABASE_ANON_KEY : undefined);

if (isProduction && smsPrimaryProvider === 'twilio' &&
    !process.env.TWILIO_MESSAGING_SERVICE_SID && !process.env.TWILIO_PHONE_NUMBER) {
  throw new Error('Twilio requires TWILIO_MESSAGING_SERVICE_SID or TWILIO_PHONE_NUMBER');
}

if (turnstileEnabled && !process.env.TURNSTILE_SECRET_KEY) {
  throw new Error('TURNSTILE_ENABLED requires TURNSTILE_SECRET_KEY');
}

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

  // Cloudflare Turnstile. Production protection is opt-in and must never be
  // considered active unless TURNSTILE_ENABLED and the secret are configured.
  TURNSTILE_ENABLED: turnstileEnabled,
  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY || '',
  TURNSTILE_ALLOWED_HOSTNAMES: parseListEnv(process.env.TURNSTILE_ALLOWED_HOSTNAMES),
  TURNSTILE_VERIFY_URL: process.env.TURNSTILE_VERIFY_URL || 'https://challenges.cloudflare.com/turnstile/v0/siteverify',

  // Optional backend-managed logical database operations. Provider-managed
  // Supabase backups remain preferred when these are disabled.
  DATABASE_BACKUP_ENABLED: databaseBackupEnabled,
  DATABASE_RESTORE_ENABLED: databaseRestoreEnabled,
  DATABASE_URL: process.env.DATABASE_URL || '',
  DATABASE_BACKUP_BUCKET: process.env.DATABASE_BACKUP_BUCKET || 'agriculnet-backups',
  DATABASE_BACKUP_MAX_BYTES: parseBoundedIntegerEnv(
    process.env.DATABASE_BACKUP_MAX_BYTES,
    250 * 1024 * 1024,
    1024 * 1024,
    1024 * 1024 * 1024
  ),
  PG_DUMP_PATH: process.env.PG_DUMP_PATH || 'pg_dump',
  PG_RESTORE_PATH: process.env.PG_RESTORE_PATH || 'pg_restore',

  // JWT
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || '15m',
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || '30d',

  // Bcrypt
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,

  // Email
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || 'resend',
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'AgriculNet <inf@agriculnet.farm>',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',
  MAILGUN_API_KEY: process.env.MAILGUN_API_KEY || '',
  MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN || '',

  // SMS
  SMS_PRIMARY_PROVIDER: smsPrimaryProvider,
  AT_API_KEY: process.env.AT_API_KEY || '',
  AT_USERNAME: process.env.AT_USERNAME || '',
  AT_SENDER_ID: process.env.AT_SENDER_ID === undefined ? '' : process.env.AT_SENDER_ID.trim(),
  AT_SANDBOX: parseBooleanEnv(process.env.AT_SANDBOX, true),
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '',
  TWILIO_MESSAGING_SERVICE_SID: process.env.TWILIO_MESSAGING_SERVICE_SID || '',
  SMS_TEST_OTP: !isProduction ? parseSmsTestOtp(process.env.SMS_TEST_OTP) : {},
  SMS_DEV_FIXED_OTP: !isProduction ? parseFixedOtp(process.env.SMS_DEV_FIXED_OTP) : '',

  // Meta WhatsApp Cloud API relay (optional until explicitly enabled)
  WHATSAPP_RELAY_ENABLED: parseBooleanEnv(process.env.WHATSAPP_RELAY_ENABLED, false),
  WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN || '',
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN || '',
  WHATSAPP_APP_SECRET: process.env.WHATSAPP_APP_SECRET || '',
  WHATSAPP_API_VERSION: process.env.WHATSAPP_API_VERSION || 'v23.0',
  WHATSAPP_INQUIRY_TEMPLATE_NAME: process.env.WHATSAPP_INQUIRY_TEMPLATE_NAME || '',
  WHATSAPP_TEMPLATE_LANGUAGE_CODE: process.env.WHATSAPP_TEMPLATE_LANGUAGE_CODE || 'en_US',
  WHATSAPP_REQUEST_TIMEOUT_MS: parseBoundedIntegerEnv(
    process.env.WHATSAPP_REQUEST_TIMEOUT_MS,
    10 * 1000,
    1000,
    30 * 1000
  ),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  // Private verification storage
  SUPABASE_VERIFICATION_BUCKET: process.env.SUPABASE_VERIFICATION_BUCKET || 'farmer-verifications',
  SUPABASE_ASSETS_BUCKET: process.env.SUPABASE_ASSETS_BUCKET || 'agriculnet-assets',

  // OTP
  OTP_LENGTH: parseInt(process.env.OTP_LENGTH, 10) || 6,
  OTP_EXPIRES_MINUTES: parseInt(process.env.OTP_EXPIRES_MINUTES, 10) || 10,
  OTP_MAX_ATTEMPTS: parseInt(process.env.OTP_MAX_ATTEMPTS, 10) || 3,

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  AUTH_RATE_LIMIT_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 10,

  // AI assistant (all provider keys remain optional so the rest of the API can boot)
  AI_PROVIDER_ORDER: parseListEnv(
    process.env.AI_PROVIDER_ORDER,
    'openrouter,groq,gemini,cerebras'
  ).map(provider => provider.toLowerCase()),
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'openrouter/free',
  OPENROUTER_FALLBACK_MODELS: parseListEnv(process.env.OPENROUTER_FALLBACK_MODELS),
  AI_VISION_MODEL: process.env.AI_VISION_MODEL || 'google/gemini-2.5-flash',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  GROQ_MODEL: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
  AI_TRANSCRIPTION_MODEL: process.env.AI_TRANSCRIPTION_MODEL || 'whisper-large-v3-turbo',
  AI_TRANSCRIPTION_LANGUAGE: process.env.AI_TRANSCRIPTION_LANGUAGE || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite',
  CEREBRAS_API_KEY: process.env.CEREBRAS_API_KEY || '',
  CEREBRAS_MODEL: process.env.CEREBRAS_MODEL || 'gpt-oss-120b',
  AI_REQUEST_TIMEOUT_MS: aiRequestTimeoutMs,
  AI_PROVIDER_TIMEOUT_MS: aiProviderTimeoutMs,
  AI_RATE_LIMIT_WINDOW_MS: parseInt(process.env.AI_RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  AI_RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.AI_RATE_LIMIT_MAX_REQUESTS, 10) || 12,

  // Client URLs
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  EMAIL_VERIFY_URL: process.env.EMAIL_VERIFY_URL || 'http://localhost:3000/verify-email',
  PASSWORD_RESET_URL: process.env.PASSWORD_RESET_URL || 'http://localhost:3000/reset-password',

  // Fapshi hosted checkout. Sandbox is the safe default; live requires an
  // explicit FAPSHI_MODE=live switch.
  FAPSHI_MODE: process.env.FAPSHI_MODE === 'live' ? 'live' : 'sandbox',
  FAPSHI_BASE_URL: process.env.FAPSHI_BASE_URL || (process.env.FAPSHI_MODE === 'live'
    ? 'https://live.fapshi.com'
    : 'https://sandbox.fapshi.com'),
  FAPSHI_API_USER: process.env.FAPSHI_API_USER || '',
  FAPSHI_API_KEY: process.env.FAPSHI_API_KEY || '',
  FAPSHI_WEBHOOK_SECRET: process.env.FAPSHI_WEBHOOK_SECRET || '',
  FAPSHI_REQUEST_TIMEOUT_MS: parseBoundedIntegerEnv(
    process.env.FAPSHI_REQUEST_TIMEOUT_MS,
    10 * 1000,
    1000,
    30 * 1000
  ),

  // Standards-based Web Push. Optional until all three VAPID values exist.
  WEB_PUSH_PUBLIC_KEY: process.env.WEB_PUSH_PUBLIC_KEY || '',
  WEB_PUSH_PRIVATE_KEY: process.env.WEB_PUSH_PRIVATE_KEY || '',
  WEB_PUSH_SUBJECT: process.env.WEB_PUSH_SUBJECT || 'mailto:inf@agriculnet.farm',

  // Development helpers
  ALLOW_DEV_DELIVERY_FALLBACK: allowDevDeliveryFallback,
  EXPOSE_DEV_AUTH_HINTS: exposeDevAuthHints
};
