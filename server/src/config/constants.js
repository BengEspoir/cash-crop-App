module.exports = {
  USER_ROLES: {
    FARMER: 'farmer',
    RESELLER: 'reseller',
    LOCAL_BUYER: 'local_buyer',
    INTERNATIONAL_BUYER: 'international_buyer',
    FIELD_AGENT: 'field_agent',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin'
  },
  USER_STATUS: {
    PENDING_VERIFICATION: 'pending_verification',
    PENDING_IDENTITY_VERIFICATION: 'pending_identity_verification',
    PENDING_REVIEW: 'pending_review',
    ACTIVE: 'active',
    SUSPENDED: 'suspended',
    REJECTED: 'rejected',
    DEACTIVATED: 'deactivated'
  },
  BUYER_TYPES: {
    LOCAL: 'local',
    INTERNATIONAL: 'international',
    BUSINESS: 'business_reseller'
  },
  OTP_PURPOSE: {
    PHONE_VERIFICATION: 'phone_verification',
    PASSWORD_RESET: 'password_reset',
    LOGIN_OTP: 'login_otp'
  },
  TOKEN_TYPE: {
    EMAIL_VERIFICATION: 'email_verification',
    PASSWORD_RESET: 'password_reset',
    REFRESH_TOKEN: 'refresh_token'
  },
  ERROR_CODES: {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    DUPLICATE_PHONE: 'DUPLICATE_PHONE',
    DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    ACCOUNT_NOT_FOUND: 'ACCOUNT_NOT_FOUND',
    ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
    ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
    ACCOUNT_PENDING: 'ACCOUNT_PENDING',
    EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
    PHONE_NOT_VERIFIED: 'PHONE_NOT_VERIFIED',
    TOKEN_INVALID: 'TOKEN_INVALID',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    OTP_INVALID: 'OTP_INVALID',
    OTP_EXPIRED: 'OTP_EXPIRED',
    OTP_MAX_ATTEMPTS: 'OTP_MAX_ATTEMPTS',
    EMAIL_DELIVERY_FAILED: 'EMAIL_DELIVERY_FAILED',
    SMS_DELIVERY_FAILED: 'SMS_DELIVERY_FAILED',
    RATE_LIMITED: 'RATE_LIMITED',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    SERVER_ERROR: 'SERVER_ERROR',
    NOT_FOUND: 'NOT_FOUND'
  },
  CAMEROON_REGIONS: [
    'South West', 'Littoral', 'West', 'North West',
    'Centre', 'North', 'Adamawa', 'South', 'East', 'Far North'
  ]
};
