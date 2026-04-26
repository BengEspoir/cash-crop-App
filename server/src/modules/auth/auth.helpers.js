const { USER_ROLES, USER_STATUS } = require('../../config/constants');

const normalizePhone = (phone) => {
  const cleaned = phone.replace(/[\s\-]/g, '');
  if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('237')) {
      return '+' + cleaned;
    }
    return '+237' + cleaned;
  }
  return cleaned;
};

const isPhone = (identifier) => {
  return /^\+237[0-9]{9}$/.test(identifier);
};

const isEmail = (identifier) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
};

const maskPhone = (phone) => {
  if (!phone || phone.length < 6) return phone;
  return phone.slice(0, -6) + '***' + phone.slice(-3);
};

const maskEmail = (email) => {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  const maskedLocal = local.charAt(0) + '***' + local.charAt(local.length - 1);
  return maskedLocal + '@' + domain;
};

const splitContactName = (contactName = '') => {
  const [firstName = '', ...rest] = contactName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName,
    lastName: rest.join(' ') || 'Buyer'
  };
};

const toCropList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const shouldAdvanceToActive = (user) => {
  return (
    (user.role === USER_ROLES.LOCAL_BUYER || user.role === USER_ROLES.INTERNATIONAL_BUYER) &&
    user.phone_verified &&
    user.email_verified
  );
};

const shouldAdvanceToPendingReview = (user) => {
  // Farmers need manual review, buyers get auto-approved
  return user.role === USER_ROLES.FARMER && user.phone_verified && user.email_verified;
};

const getNextStatus = (user) => {
  if (shouldAdvanceToActive(user)) {
    return USER_STATUS.ACTIVE;
  }

  if (shouldAdvanceToPendingReview(user)) {
    return USER_STATUS.PENDING_REVIEW;
  }

  return user.status || USER_STATUS.PENDING_VERIFICATION;
};

const sanitizeUser = (user) => {
  const { password_hash, ...sanitized } = user;
  return sanitized;
};

module.exports = {
  normalizePhone,
  isPhone,
  isEmail,
  maskPhone,
  maskEmail,
  splitContactName,
  toCropList,
  shouldAdvanceToActive,
  shouldAdvanceToPendingReview,
  getNextStatus,
  sanitizeUser
};
