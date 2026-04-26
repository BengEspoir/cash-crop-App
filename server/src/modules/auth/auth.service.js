const bcrypt = require('bcryptjs');
const repository = require('./auth.repository');
const helpers = require('./auth.helpers');
const AppError = require('../../utils/AppError');
const tokenHelper = require('../../utils/tokenHelper');
const otpUtil = require('../../utils/otp');
const mailer = require('../../utils/mailer');
const sms = require('../../utils/sms');
const {
  USER_ROLES,
  USER_STATUS,
  BUYER_TYPES,
  TOKEN_TYPE,
  OTP_PURPOSE,
  ERROR_CODES
} = require('../../config/constants');
const env = require('../../config/env');

const collectDevHints = (...deliveries) => {
  const merged = {};

  for (const delivery of deliveries) {
    if (delivery?.devHints) {
      Object.assign(merged, delivery.devHints);
    }
  }

  return Object.keys(merged).length > 0 ? merged : undefined;
};

const withDevHints = (payload, ...deliveries) => {
  const devHints = collectDevHints(...deliveries);
  return devHints ? { ...payload, devHints } : payload;
};

const normalizeIdentifier = (identifier) => {
  if (!identifier) {
    return identifier;
  }

  return identifier.includes('@')
    ? identifier.toLowerCase()
    : helpers.normalizePhone(identifier);
};

const createOtpForUser = async (user, purpose) => {
  const otpCode = otpUtil.generateOtp();
  const otpHash = await otpUtil.hashOtp(otpCode);
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRES_MINUTES * 60 * 1000);

  await repository.deleteUserOtps(user.id, purpose);
  await repository.saveOtp({
    user_id: user.id,
    phone: user.phone,
    otp_hash: otpHash,
    purpose,
    expires_at: expiresAt.toISOString()
  });

  return sms.sendOtpSms(user.phone, otpCode);
};

const createEmailVerificationForUser = async (user) => {
  if (!user.email) {
    return null;
  }

  const rawToken = tokenHelper.generateCryptoToken();
  const tokenHash = tokenHelper.hashToken(rawToken);
  const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await repository.saveToken({
    user_id: user.id,
    token_hash: tokenHash,
    type: TOKEN_TYPE.EMAIL_VERIFICATION,
    expires_at: tokenExpires.toISOString()
  });

  const verifyLink = `${env.EMAIL_VERIFY_URL}?token=${rawToken}`;
  return mailer.sendVerificationEmail(user.email, user.first_name, verifyLink);
};

const createPasswordResetEmailForUser = async (user) => {
  const rawToken = tokenHelper.generateCryptoToken();
  const tokenHash = tokenHelper.hashToken(rawToken);
  const tokenExpires = new Date(Date.now() + 60 * 60 * 1000);

  await repository.saveToken({
    user_id: user.id,
    token_hash: tokenHash,
    type: TOKEN_TYPE.PASSWORD_RESET,
    expires_at: tokenExpires.toISOString()
  });

  const resetLink = `${env.PASSWORD_RESET_URL}?token=${rawToken}`;
  return mailer.sendPasswordResetEmail(user.email, user.first_name, resetLink);
};

const createSession = async (user, rememberMe = false) => {
  const accessToken = tokenHelper.generateAccessToken(user.id, user.role);
  const refreshToken = tokenHelper.generateRefreshToken(user.id, rememberMe);
  const refreshTokenHash = tokenHelper.hashToken(refreshToken);

  const refreshExpires = rememberMe
    ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await repository.saveToken({
    user_id: user.id,
    token_hash: refreshTokenHash,
    type: TOKEN_TYPE.REFRESH_TOKEN,
    expires_at: refreshExpires.toISOString()
  });

  return {
    accessToken,
    refreshToken
  };
};

const syncUserStatus = async (user) => {
  const nextStatus = helpers.getNextStatus(user);

  if (nextStatus !== user.status) {
    return repository.updateUser(user.id, { status: nextStatus });
  }

  return user;
};

const registerFarmer = async (data, req) => {
  const phone = helpers.normalizePhone(data.phone);
  const email = data.email ? data.email.toLowerCase() : null;
  const existingPhone = await repository.findUserByPhone(phone);
  if (existingPhone) {
    throw new AppError('Phone number already registered', 409, ERROR_CODES.DUPLICATE_PHONE);
  }

  if (email) {
    const existingEmail = await repository.findUserByEmail(email);
    if (existingEmail) {
      throw new AppError('Email already registered', 409, ERROR_CODES.DUPLICATE_EMAIL);
    }
  }

  const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_SALT_ROUNDS);

  const user = await repository.createUser({
    role: USER_ROLES.FARMER,
    status: USER_STATUS.PENDING_VERIFICATION,
    first_name: data.firstName,
    last_name: data.lastName,
    phone,
    email,
    password_hash: passwordHash,
    phone_verified: false,
    email_verified: !email,
    region: data.region,
    city: data.city,
    country: 'Cameroon'
  });

  await repository.createFarmerProfile(user.id, {
    farm_name: data.farmName || data.cooperative || null,
    cooperative_name: data.cooperative || null,
    crops_grown: helpers.toCropList(data.cropsGrown?.length ? data.cropsGrown : data.primaryCrop),
    primary_crop: data.primaryCrop || null,
    harvest_volume: data.harvestVolume || null,
    export_ready: typeof data.exportReady === 'boolean' ? data.exportReady : null,
    inspection_preference: data.inspectionPreference || null,
    payout_method: data.payoutMethod || null,
    payout_account_name: data.accountName || null,
    payout_phone: data.payoutPhone ? helpers.normalizePhone(data.payoutPhone) : null,
    notification_opt_in: typeof data.notificationOptIn === 'boolean' ? data.notificationOptIn : true
  });

  const smsDelivery = await createOtpForUser(user, OTP_PURPOSE.PHONE_VERIFICATION);
  const emailDelivery = email ? await createEmailVerificationForUser(user) : null;

  await repository.logAuditEvent(user.id, 'FARMER_REGISTERED', req, { phone, email });

  return withDevHints({
    user: helpers.sanitizeUser(user),
    message: email
      ? 'Registration successful. Verify your phone first, then confirm your email.'
      : 'Registration successful. Please verify your phone number.',
    phone: helpers.maskPhone(phone),
    nextStep: 'verify_phone'
  }, smsDelivery, emailDelivery);
};

const registerBuyer = async (data, req) => {
  // Handle phone normalization based on buyer type
  let phone;
  if (data.buyerType === BUYER_TYPES.INTERNATIONAL && data.countryCode) {
    // Use new phone validator for international numbers
    const { formatPhoneInternational } = require('../../utils/phoneValidator');
    phone = formatPhoneInternational(data.phone, data.countryCode);
  } else {
    // Use legacy helper for local buyers (Cameroon)
    phone = helpers.normalizePhone(data.phone);
  }
  
  const email = data.email.toLowerCase();
  const existingPhone = await repository.findUserByPhone(phone);
  if (existingPhone) {
    throw new AppError('Phone number already registered', 409, ERROR_CODES.DUPLICATE_PHONE);
  }

  const existingEmail = await repository.findUserByEmail(email);
  if (existingEmail) {
    throw new AppError('Email already registered', 409, ERROR_CODES.DUPLICATE_EMAIL);
  }

  const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_SALT_ROUNDS);
  const splitName = data.contactName
    ? helpers.splitContactName(data.contactName)
    : { firstName: data.firstName, lastName: data.lastName };

  let role = USER_ROLES.LOCAL_BUYER;
  if (data.buyerType === BUYER_TYPES.INTERNATIONAL) role = USER_ROLES.INTERNATIONAL_BUYER;
  if (data.buyerType === BUYER_TYPES.BUSINESS) role = USER_ROLES.LOCAL_BUYER;

  const user = await repository.createUser({
    role,
    status: USER_STATUS.PENDING_VERIFICATION,
    first_name: splitName.firstName,
    last_name: splitName.lastName,
    phone,
    email,
    password_hash: passwordHash,
    phone_verified: false,
    email_verified: false,
    region: data.region || null,
    city: data.city || null,
    country: data.country
  });

  await repository.createBuyerProfile(user.id, {
    buyer_type: data.buyerType,
    company_name: data.companyName || null,
    preferred_crops: helpers.toCropList(data.preferredCrops?.length ? data.preferredCrops : data.buyingFocus),
    annual_import_volume: data.monthlyVolume || null,
    import_country: data.country || null,
    destination_market: data.destination || null
  });

  const smsDelivery = await createOtpForUser(user, OTP_PURPOSE.PHONE_VERIFICATION);
  const emailDelivery = await createEmailVerificationForUser(user);

  await repository.logAuditEvent(user.id, 'BUYER_REGISTERED', req, {
    phone,
    email,
    buyerType: data.buyerType
  });

  return withDevHints({
    user: helpers.sanitizeUser(user),
    message: 'Registration successful. Verify your phone first, then confirm your email.',
    phone: helpers.maskPhone(phone),
    nextStep: 'verify_phone'
  }, smsDelivery, emailDelivery);
};

const login = async (identifier, password, rememberMe, req) => {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  const user = await repository.findUserByIdentifier(normalizedIdentifier);

  if (!user) {
    throw new AppError('Invalid credentials', 401, ERROR_CODES.INVALID_CREDENTIALS);
  }

  if ([USER_STATUS.SUSPENDED, USER_STATUS.REJECTED, USER_STATUS.DEACTIVATED].includes(user.status)) {
    throw new AppError('Account unavailable', 403, ERROR_CODES.ACCOUNT_SUSPENDED);
  }

  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    throw new AppError('Account temporarily locked', 403, ERROR_CODES.ACCOUNT_LOCKED, {
      lockedUntil: user.locked_until
    });
  }

  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    const updatedUser = await repository.incrementFailedAttempts(user.id);
    if ((updatedUser?.failed_login_attempts || 0) >= 5) {
      const lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      await repository.lockUserAccount(user.id, lockUntil.toISOString());
    }
    throw new AppError('Invalid credentials', 401, ERROR_CODES.INVALID_CREDENTIALS);
  }

  await repository.resetFailedAttempts(user.id);
  const refreshedUser = await repository.updateLastLogin(user.id);

  if (!refreshedUser.phone_verified) {
    const smsDelivery = await createOtpForUser(refreshedUser, OTP_PURPOSE.PHONE_VERIFICATION);

    throw new AppError(
      'Phone verification required',
      403,
      ERROR_CODES.PHONE_NOT_VERIFIED,
      withDevHints({
        userId: refreshedUser.id,
        role: refreshedUser.role,
        phone: helpers.maskPhone(refreshedUser.phone),
        email: refreshedUser.email ? helpers.maskEmail(refreshedUser.email) : null,
        nextStep: 'verify_phone'
      }, smsDelivery)
    );
  }

  const session = await createSession(refreshedUser, rememberMe);

  await repository.logAuditEvent(refreshedUser.id, 'LOGIN_SUCCESS', req, { method: 'password' });

  return {
    user: helpers.sanitizeUser(refreshedUser),
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    nextStep: refreshedUser.status === USER_STATUS.PENDING_REVIEW ? 'pending_review' : 'dashboard'
  };
};

const logout = async (userId, refreshToken, req) => {
  if (refreshToken) {
    const tokenHash = tokenHelper.hashToken(refreshToken);
    const token = await repository.findToken(tokenHash, TOKEN_TYPE.REFRESH_TOKEN);
    if (token) {
      await repository.markTokenUsed(token.id);
    }
  }
  await repository.deleteUserTokens(userId, TOKEN_TYPE.REFRESH_TOKEN);
  await repository.logAuditEvent(userId, 'LOGOUT', req, {});
};

const refreshAccessToken = async (rawRefreshToken) => {
  let decoded;
  try {
    decoded = tokenHelper.verifyRefreshToken(rawRefreshToken);
  } catch {
    throw new AppError('Invalid refresh token', 401, ERROR_CODES.TOKEN_INVALID);
  }

  const tokenHash = tokenHelper.hashToken(rawRefreshToken);
  const token = await repository.findToken(tokenHash, TOKEN_TYPE.REFRESH_TOKEN);

  if (!token) {
    throw new AppError('Invalid refresh token', 401, ERROR_CODES.TOKEN_INVALID);
  }

  const user = await repository.findUserById(decoded.id);
  if (!user || [USER_STATUS.SUSPENDED, USER_STATUS.REJECTED, USER_STATUS.DEACTIVATED].includes(user.status)) {
    throw new AppError('User not found or inactive', 401, ERROR_CODES.UNAUTHORIZED);
  }

  const newAccessToken = tokenHelper.generateAccessToken(user.id, user.role);

  return {
    accessToken: newAccessToken,
    user: helpers.sanitizeUser(user)
  };
};

const verifyEmail = async (rawToken, req) => {
  const tokenHash = tokenHelper.hashToken(rawToken);
  const token = await repository.findToken(tokenHash, TOKEN_TYPE.EMAIL_VERIFICATION);

  if (!token) {
    throw new AppError('Invalid or expired verification link', 400, ERROR_CODES.TOKEN_INVALID);
  }

  await repository.updateUser(token.user_id, { email_verified: true });
  await repository.markTokenUsed(token.id);

  const updatedUser = await syncUserStatus(await repository.findUserById(token.user_id));
  await repository.logAuditEvent(updatedUser.id, 'EMAIL_VERIFIED', req, {});

  return {
    message: 'Email verified successfully',
    user: helpers.sanitizeUser(updatedUser),
    nextStep: updatedUser.status === USER_STATUS.PENDING_REVIEW ? 'pending_review' : 'sign_in'
  };
};

const sendPhoneOtp = async (phone, userId, purpose, req) => {
  let user;
  if (userId) {
    user = await repository.findUserById(userId);
  } else if (phone) {
    const normalizedPhone = helpers.normalizePhone(phone);
    user = await repository.findUserByPhone(normalizedPhone);
  }

  if (!user) {
    throw new AppError('User not found', 404, ERROR_CODES.ACCOUNT_NOT_FOUND);
  }

  const smsDelivery = await createOtpForUser(user, purpose || OTP_PURPOSE.PHONE_VERIFICATION);

  await repository.logAuditEvent(user.id, 'OTP_SENT', req, {
    purpose: purpose || OTP_PURPOSE.PHONE_VERIFICATION
  });

  return withDevHints({
    success: true,
    phone: helpers.maskPhone(user.phone),
    expiresIn: env.OTP_EXPIRES_MINUTES * 60
  }, smsDelivery);
};

const confirmPhoneOtp = async (userId, otpCode, req) => {
  const user = await repository.findUserById(userId);
  if (!user) {
    throw new AppError('User not found', 404, ERROR_CODES.ACCOUNT_NOT_FOUND);
  }

  const otp = await repository.findLatestOtp(userId, OTP_PURPOSE.PHONE_VERIFICATION);
  if (!otp) {
    throw new AppError('OTP not found', 400, ERROR_CODES.OTP_INVALID);
  }

  if (new Date(otp.expires_at) < new Date()) {
    throw new AppError('OTP has expired', 400, ERROR_CODES.OTP_EXPIRED);
  }

  if (otp.attempts >= env.OTP_MAX_ATTEMPTS) {
    throw new AppError('Maximum attempts exceeded', 400, ERROR_CODES.OTP_MAX_ATTEMPTS);
  }

  await repository.incrementOtpAttempts(otp.id);

  const isValid = await otpUtil.verifyOtp(otpCode, otp.otp_hash);
  if (!isValid) {
    throw new AppError('Invalid OTP', 400, ERROR_CODES.OTP_INVALID);
  }

  await repository.markOtpVerified(otp.id);
  await repository.updateUser(userId, { phone_verified: true });

  const updatedUser = await syncUserStatus(await repository.findUserById(userId));
  await repository.logAuditEvent(userId, 'PHONE_VERIFIED', req, {});

  if (updatedUser.status === USER_STATUS.ACTIVE) {
    const session = await createSession(updatedUser);

    return {
      verified: true,
      message: 'Phone verified successfully',
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      user: helpers.sanitizeUser(updatedUser),
      nextStep: 'dashboard'
    };
  }

  return {
    verified: true,
    message: updatedUser.status === USER_STATUS.PENDING_REVIEW
      ? 'Phone verified successfully. Your account is now under review.'
      : 'Phone verified successfully. Please verify your email to continue.',
    user: helpers.sanitizeUser(updatedUser),
    nextStep: updatedUser.status === USER_STATUS.PENDING_REVIEW ? 'pending_review' : 'verify_email'
  };
};

const forgotPassword = async (identifier, method, req) => {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  const user = await repository.findUserByIdentifier(normalizedIdentifier);

  if (!user) {
    return { message: 'If an account exists, a reset option has been sent' };
  }

  let delivery = null;
  let target = null;

  if (method === 'sms') {
    delivery = await createOtpForUser(user, OTP_PURPOSE.PASSWORD_RESET);
    target = helpers.maskPhone(user.phone);
  } else if (method === 'email' && user.email) {
    delivery = await createPasswordResetEmailForUser(user);
    target = helpers.maskEmail(user.email);
  }

  await repository.logAuditEvent(user.id, 'PASSWORD_RESET_REQUESTED', req, { method });

  return withDevHints({
    message: 'If an account exists, a reset option has been sent',
    identifier: normalizedIdentifier,
    method,
    target,
    nextStep: 'reset_password'
  }, delivery);
};

const resetPassword = async (payload, req) => {
  let user = null;
  let userId = payload.userId || null;

  if (payload.token) {
    const tokenHash = tokenHelper.hashToken(payload.token);
    const tokenRecord = await repository.findToken(tokenHash, TOKEN_TYPE.PASSWORD_RESET);
    if (!tokenRecord) {
      throw new AppError('Invalid or expired reset token', 400, ERROR_CODES.TOKEN_INVALID);
    }
    await repository.markTokenUsed(tokenRecord.id);
    userId = tokenRecord.user_id;
  }

  if (payload.otp) {
    if (!userId && payload.identifier) {
      user = await repository.findUserByIdentifier(normalizeIdentifier(payload.identifier));
      userId = user?.id || null;
    }

    if (!userId) {
      throw new AppError('Verification required', 400, ERROR_CODES.VALIDATION_ERROR);
    }
  }

  user = user || await repository.findUserById(userId);
  if (!user) {
    throw new AppError('User not found', 404, ERROR_CODES.ACCOUNT_NOT_FOUND);
  }

  if (payload.otp) {
    const otpRecord = await repository.findLatestOtp(user.id, OTP_PURPOSE.PASSWORD_RESET);
    if (!otpRecord) {
      throw new AppError('Invalid OTP', 400, ERROR_CODES.OTP_INVALID);
    }
    if (new Date(otpRecord.expires_at) < new Date()) {
      throw new AppError('OTP has expired', 400, ERROR_CODES.OTP_EXPIRED);
    }
    const isValid = await otpUtil.verifyOtp(payload.otp, otpRecord.otp_hash);
    if (!isValid) {
      throw new AppError('Invalid OTP', 400, ERROR_CODES.OTP_INVALID);
    }
    await repository.markOtpVerified(otpRecord.id);
  }

  const passwordHash = await bcrypt.hash(payload.newPassword, env.BCRYPT_SALT_ROUNDS);
  await repository.updateUser(user.id, { password_hash: passwordHash });
  await repository.deleteUserTokens(user.id, TOKEN_TYPE.REFRESH_TOKEN);

  await repository.logAuditEvent(user.id, 'PASSWORD_RESET_COMPLETED', req, {});

  return {
    message: 'Password reset successfully. Please sign in again.',
    nextStep: 'sign_in'
  };
};

const resendVerification = async (userId, type, req) => {
  const user = await repository.findUserById(userId);
  if (!user) {
    throw new AppError('User not found', 404, ERROR_CODES.ACCOUNT_NOT_FOUND);
  }

  if (type === 'email') {
    if (!user.email) {
      throw new AppError('No email address is available for this account', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    const emailDelivery = await createEmailVerificationForUser(user);
    await repository.logAuditEvent(user.id, 'EMAIL_VERIFICATION_RESENT', req, {});

    return withDevHints({
      target: helpers.maskEmail(user.email),
      nextStep: 'verify_email'
    }, emailDelivery);
  }

  const smsDelivery = await createOtpForUser(user, OTP_PURPOSE.PHONE_VERIFICATION);
  await repository.logAuditEvent(user.id, 'PHONE_VERIFICATION_RESENT', req, {});

  return withDevHints({
    target: helpers.maskPhone(user.phone),
    nextStep: 'verify_phone'
  }, smsDelivery);
};

const getMe = async (userId) => {
  const user = await repository.findUserById(userId);
  if (!user) {
    throw new AppError('User not found', 404, ERROR_CODES.ACCOUNT_NOT_FOUND);
  }

  const result = { user: helpers.sanitizeUser(user) };

  if (user.role === USER_ROLES.FARMER) {
    result.profile = await repository.getFarmerProfile(userId);
  } else if (user.role === USER_ROLES.LOCAL_BUYER || user.role === USER_ROLES.INTERNATIONAL_BUYER) {
    result.profile = await repository.getBuyerProfile(userId);
  }

  return result;
};

const updateMe = async (userId, updateData) => {
  const allowedUserFields = ['first_name', 'last_name', 'region', 'city', 'country'];
  const userUpdates = {};

  for (const field of allowedUserFields) {
    if (updateData[field] !== undefined) {
      userUpdates[field] = updateData[field];
    }
  }

  if (Object.keys(userUpdates).length > 0) {
    await repository.updateUser(userId, userUpdates);
  }

  const user = await repository.findUserById(userId);
  const result = { user: helpers.sanitizeUser(user) };

  if (user.role === USER_ROLES.FARMER) {
    const allowedProfileFields = [
      'farm_name',
      'cooperative_name',
      'bio',
      'crops_grown',
      'primary_crop',
      'harvest_volume',
      'export_ready',
      'inspection_preference',
      'payout_method',
      'payout_account_name',
      'payout_phone',
      'notification_opt_in'
    ];
    const profileUpdates = {};
    for (const field of allowedProfileFields) {
      if (updateData[field] !== undefined) {
        profileUpdates[field] = field === 'payout_phone' && updateData[field]
          ? helpers.normalizePhone(updateData[field])
          : updateData[field];
      }
    }
    if (Object.keys(profileUpdates).length > 0) {
      const { supabaseAdmin } = require('../../config/supabase');
      await supabaseAdmin
        .from('farmer_profiles')
        .update(profileUpdates)
        .eq('user_id', userId);
    }
    result.profile = await repository.getFarmerProfile(userId);
  } else if (user.role === USER_ROLES.LOCAL_BUYER || user.role === USER_ROLES.INTERNATIONAL_BUYER) {
    const allowedProfileFields = [
      'company_name',
      'preferred_crops',
      'annual_import_volume',
      'import_country',
      'destination_market'
    ];
    const profileUpdates = {};
    for (const field of allowedProfileFields) {
      if (updateData[field] !== undefined) {
        profileUpdates[field] = updateData[field];
      }
    }
    if (Object.keys(profileUpdates).length > 0) {
      const { supabaseAdmin } = require('../../config/supabase');
      await supabaseAdmin
        .from('buyer_profiles')
        .update(profileUpdates)
        .eq('user_id', userId);
    }
    result.profile = await repository.getBuyerProfile(userId);
  }

  return result;
};

const deactivateAccount = async (userId, password, req) => {
  const user = await repository.findUserById(userId);
  if (!user) {
    throw new AppError('User not found', 404, ERROR_CODES.ACCOUNT_NOT_FOUND);
  }

  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    throw new AppError('Invalid password', 401, ERROR_CODES.INVALID_CREDENTIALS);
  }

  await repository.updateUser(userId, { status: USER_STATUS.DEACTIVATED });
  await repository.deleteUserTokens(userId, TOKEN_TYPE.REFRESH_TOKEN);

  await repository.logAuditEvent(userId, 'ACCOUNT_DEACTIVATED', req, {});

  return { message: 'Account deactivated successfully' };
};

module.exports = {
  registerFarmer,
  registerBuyer,
  login,
  logout,
  refreshAccessToken,
  verifyEmail,
  sendPhoneOtp,
  confirmPhoneOtp,
  forgotPassword,
  resetPassword,
  resendVerification,
  getMe,
  updateMe,
  deactivateAccount
};
