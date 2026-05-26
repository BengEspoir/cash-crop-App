const bcrypt = require('bcryptjs');
const path = require('path');
const repository = require('./auth.repository');
const helpers = require('./auth.helpers');
const AppError = require('../../utils/AppError');
const tokenHelper = require('../../utils/tokenHelper');
const otpUtil = require('../../utils/otp');
const mailer = require('../../utils/mailer');
const sms = require('../../utils/sms');
const { supabaseAdmin } = require('../../config/supabase');
const { FARMER_VERIFICATION_STATUS } = require('../../utils/marketplace');
const {
  USER_ROLES,
  USER_STATUS,
  BUYER_TYPES,
  TOKEN_TYPE,
  OTP_PURPOSE,
  ERROR_CODES
} = require('../../config/constants');
const env = require('../../config/env');

const oauthExchange = async (payload = {}, req) => {
  const provider = String(payload.provider || '').trim() || 'oauth';
  const supabaseAccessToken = String(payload.supabaseAccessToken || '').trim();

  if (!supabaseAccessToken) {
    throw new AppError('supabaseAccessToken is required', 400, ERROR_CODES.VALIDATION_ERROR);
  }

  const { data, error } = await supabaseAdmin.auth.getUser(supabaseAccessToken);
  if (error || !data?.user) {
    throw new AppError('OAuth session is invalid or expired', 401, ERROR_CODES.UNAUTHORIZED);
  }

  const email = (data.user.email || '').toLowerCase();
  if (!email) {
    throw new AppError('OAuth user email is missing', 400, ERROR_CODES.VALIDATION_ERROR);
  }

  let user = await repository.findUserByEmail(email);

  if (!user) {
    const now = new Date().toISOString();
    user = await repository.createUser({
      role: USER_ROLES.LOCAL_BUYER,
      status: USER_STATUS.PENDING_VERIFICATION,
      first_name: data.user.user_metadata?.first_name || data.user.user_metadata?.name?.split(' ')?.[0] || 'Buyer',
      last_name: data.user.user_metadata?.last_name || data.user.user_metadata?.name?.split(' ')?.slice(1).join(' ') || 'Buyer',
      phone: null,
      email,
      password_hash: null,
      phone_verified: false,
      // OAuth providers validate email ownership; treat as verified for conversion.
      email_verified: true,
      region: null,
      city: null,
      country: payload.country || 'Cameroon',
      created_at: now,
      updated_at: now
    });

    await repository.createBuyerProfile(user.id, {
      buyer_type: BUYER_TYPES.LOCAL,
      company_name: payload.companyName || null,
      preferred_crops: [],
      annual_import_volume: null,
      import_country: payload.country || 'Cameroon',
      destination_market: null
    });
  } else {
    // Ensure email_verified is true for OAuth user
    if (!user.email_verified) {
      user = await repository.updateUser(user.id, { email_verified: true });
    }
  }

  // Update status if buyer qualifies for active after email verification (phone may still be false).
  const nextStatus = helpers.getNextStatus(user);
  if (nextStatus !== user.status) {
    user = await repository.updateUser(user.id, { status: nextStatus });
  }

  const session = await createSession(user, true);

  await repository.logAuditEvent(user.id, 'OAUTH_LOGIN', req, { provider, email });
  await repository.logActivityEvent(user.id, 'OAUTH_LOGIN', req, {
    role: user.role,
    entityType: 'user',
    entityId: user.id,
    provider
  });

  return {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    user: helpers.sanitizeUser(user),
    nextStep: helpers.getNextStep(user),
    phone: user.phone ? helpers.maskPhone(user.phone) : null,
    email: helpers.maskEmail(user.email)
  };
};

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

const normalizeContactValue = (type, value) => {
  if (type === 'email') return String(value || '').trim().toLowerCase();
  return helpers.normalizePhone(value);
};

const mapRecoveryContact = (row) => ({
  id: row.id,
  type: row.type,
  value: row.type === 'email' ? helpers.maskEmail(row.value) : helpers.maskPhone(row.value),
  isVerified: Boolean(row.is_verified),
  verifiedAt: row.verified_at,
  lastUsedAt: row.last_used_at,
  createdAt: row.created_at
});

const createOtpForUser = async (user, purpose, targetPhone = user.phone) => {
  const otpCode = otpUtil.generateOtp();
  const otpHash = await otpUtil.hashOtp(otpCode);
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRES_MINUTES * 60 * 1000);

  await repository.deleteUserOtps(user.id, purpose);
  await repository.saveOtp({
    user_id: user.id,
    phone: targetPhone,
    otp_hash: otpHash,
    purpose,
    expires_at: expiresAt.toISOString()
  });

  const delivery = await sms.sendOtpSms(targetPhone, otpCode);
  if (delivery?.devHints) {
    delivery.devHints.otpCode = otpCode;
  }
  return delivery;
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

const createPasswordResetEmailForTarget = async (user, email) => {
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
  return mailer.sendPasswordResetEmail(email, user.first_name, resetLink);
};

const createVerificationEmailForTarget = async (user, email, params = {}) => {
  const rawToken = tokenHelper.generateCryptoToken();
  const tokenHash = tokenHelper.hashToken(rawToken);
  const tokenExpires = new Date(Date.now() + 60 * 60 * 1000);

  await repository.saveToken({
    user_id: user.id,
    token_hash: tokenHash,
    type: TOKEN_TYPE.PASSWORD_RESET,
    expires_at: tokenExpires.toISOString()
  });

  const search = new URLSearchParams({
    ...params,
    token: rawToken
  });
  const verifyLink = `${env.EMAIL_VERIFY_URL}?${search.toString()}`;
  return mailer.sendVerificationEmail(email, user.first_name, verifyLink);
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

const runDelivery = async (label, task) => {
  try {
    return await task();
  } catch (err) {
    console.error(`${label} delivery error:`, err.message);
    return {
      success: false,
      delivered: false,
      provider: 'unavailable',
      error: err.message
    };
  }
};

const sanitizeDeliveryError = (message = '', channel = 'delivery') => {
  if (/535-5\.7\.8|Username and Password not accepted|Invalid login/i.test(message)) {
    return 'Gmail rejected the configured SMTP credentials. Update SMTP_PASS to a valid Gmail App Password and restart the server.';
  }

  if (/No email provider configured/i.test(message)) {
    return 'No email provider is configured for verification emails.';
  }

  if (/No SMS provider configured/i.test(message)) {
    return 'No SMS provider is configured for verification codes.';
  }

  if (/InvalidSenderId/i.test(message)) {
    return 'Africa\'s Talking rejected the SMS sender ID. Keep AT_SENDER_ID blank until AgriculNet is approved, then restart the server.';
  }

  if (/Insufficient|balance|credit/i.test(message)) {
    return 'Africa\'s Talking could not send the SMS because the wallet balance or SMS credit is insufficient.';
  }

  if (/InvalidPhoneNumber|Invalid phone|not a valid phone/i.test(message)) {
    return 'Africa\'s Talking rejected the phone number. Use international format, for example +2376XXXXXXXX.';
  }

  if (/fetch failed|ENOTFOUND|ECONNREFUSED|ETIMEDOUT/i.test(message)) {
    return `${channel === 'email' ? 'Email' : 'SMS'} provider could not be reached. Check network access and provider credentials.`;
  }

  return message || `${channel === 'email' ? 'Email' : 'SMS'} delivery failed.`;
};

const buildDeliveryStatus = (delivery, channel) => {
  if (!delivery) {
    return {
      channel,
      status: 'failed',
      delivered: false,
      provider: 'unknown',
      message: `${channel === 'email' ? 'Email' : 'SMS'} delivery status is unavailable.`
    };
  }

  if (delivery.success === false) {
    return {
      channel,
      status: 'failed',
      delivered: false,
      provider: delivery.provider || 'unknown',
      message: sanitizeDeliveryError(delivery.error, channel)
    };
  }

  if (delivery.provider === 'development-fallback') {
    return {
      channel,
      status: 'development-fallback',
      delivered: false,
      provider: delivery.provider || 'development-fallback',
      message: `${channel === 'email' ? 'Email' : 'SMS'} was not delivered by a live provider. Use the development hint to continue locally.`
    };
  }

  if (delivery.delivered === false) {
    return {
      channel,
      status: 'failed',
      delivered: false,
      provider: delivery.provider || 'unknown',
      message: sanitizeDeliveryError(delivery.error || delivery.status, channel)
    };
  }

  return {
    channel,
    status: 'delivered',
    delivered: true,
    provider: delivery.provider || 'unknown',
    messageId: delivery.messageId || null,
    fallback: Boolean(delivery.fallback)
  };
};

const isDeliveryFailed = (status) => status?.status === 'failed';

const buildAuthPayload = (user, extra = {}) => ({
  user: helpers.sanitizeUser(user),
  phone: helpers.maskPhone(user.phone),
  email: user.email ? helpers.maskEmail(user.email) : null,
  nextStep: helpers.getNextStep(user),
  ...extra
});

const formatUserName = (user) => {
  return [user.first_name, user.last_name].filter(Boolean).join(' ') ||
    user.email ||
    user.phone ||
    'Unknown user';
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

  const user = await repository.createUser({
    role: USER_ROLES.FARMER,
    status: USER_STATUS.PENDING_VERIFICATION,
    first_name: data.firstName,
    last_name: data.lastName,
    phone,
    email,
    password_hash: passwordHash,
    phone_verified: false,
    email_verified: false,
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

  const smsDelivery = await runDelivery(
    'Farmer registration SMS',
    () => createOtpForUser(user, OTP_PURPOSE.PHONE_VERIFICATION)
  );
  const emailDelivery = await runDelivery(
    'Farmer verification email',
    () => createEmailVerificationForUser(user)
  );
  const smsDeliveryStatus = buildDeliveryStatus(smsDelivery, 'sms');
  const emailDeliveryStatus = buildDeliveryStatus(emailDelivery, 'email');

  await repository.logAuditEvent(user.id, 'FARMER_REGISTERED', req, { phone, email });
  await repository.logActivityEvent(user.id, 'FARMER_REGISTERED', req, {
    role: user.role,
    entityType: 'user',
    entityId: user.id
  });

  return withDevHints({
    ...buildAuthPayload(user, { nextStep: 'verify_email' }),
    message: isDeliveryFailed(emailDeliveryStatus)
      ? 'Registration successful, but verification email could not be sent.'
      : 'Registration successful.',
    emailDelivery: emailDeliveryStatus,
    smsDelivery: smsDeliveryStatus
  }, smsDelivery, emailDelivery);
};

const registerReseller = async (data, req) => {
  const phone = helpers.normalizePhone(data.phone);
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

  const user = await repository.createUser({
    role: USER_ROLES.RESELLER,
    status: USER_STATUS.PENDING_VERIFICATION,
    first_name: data.firstName,
    last_name: data.lastName,
    phone,
    email,
    password_hash: passwordHash,
    phone_verified: false,
    email_verified: false,
    region: data.region,
    city: data.city,
    country: 'Cameroon'
  });

  await repository.createResellerProfile(user.id, {
    business_name: data.businessName || null,
    primary_crop: data.primaryCrop || null,
    crops_sold: helpers.toCropList(data.cropsSold?.length ? data.cropsSold : data.primaryCrop),
    about: data.about || null,
    payout_method: data.payoutMethod || null,
    payout_account_name: data.accountName || null,
    payout_phone: data.payoutPhone ? helpers.normalizePhone(data.payoutPhone) : null,
    notification_opt_in: typeof data.notificationOptIn === 'boolean' ? data.notificationOptIn : true
  });

  const smsDelivery = await runDelivery(
    'Reseller registration SMS',
    () => createOtpForUser(user, OTP_PURPOSE.PHONE_VERIFICATION)
  );
  const emailDelivery = await runDelivery(
    'Reseller verification email',
    () => createEmailVerificationForUser(user)
  );
  const smsDeliveryStatus = buildDeliveryStatus(smsDelivery, 'sms');
  const emailDeliveryStatus = buildDeliveryStatus(emailDelivery, 'email');

  await repository.logAuditEvent(user.id, 'RESELLER_REGISTERED', req, { phone, email });
  await repository.logActivityEvent(user.id, 'RESELLER_REGISTERED', req, {
    role: user.role,
    entityType: 'user',
    entityId: user.id
  });

  return withDevHints({
    ...buildAuthPayload(user, { nextStep: 'verify_email' }),
    message: isDeliveryFailed(emailDeliveryStatus)
      ? 'Registration successful, but verification email could not be sent.'
      : 'Registration successful.',
    emailDelivery: emailDeliveryStatus,
    smsDelivery: smsDeliveryStatus
  }, smsDelivery, emailDelivery);
};

const registerBuyer = async (data, req) => {
  const normalizedCountryCode = data.countryCode
    ? String(data.countryCode).trim().toUpperCase()
    : null;

  let phone;
  if (data.buyerType === 'international' && normalizedCountryCode) {
    const { formatPhoneInternational } = require('../../utils/phoneValidator');
    phone = formatPhoneInternational(data.phone, normalizedCountryCode);
  } else {
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

  const role = data.buyerType === 'international' ? USER_ROLES.INTERNATIONAL_BUYER : USER_ROLES.LOCAL_BUYER;

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

  const smsDelivery = await runDelivery(
    'Buyer registration SMS',
    () => createOtpForUser(user, OTP_PURPOSE.PHONE_VERIFICATION)
  );
  const emailDelivery = await runDelivery(
    'Buyer verification email',
    () => createEmailVerificationForUser(user)
  );
  const smsDeliveryStatus = buildDeliveryStatus(smsDelivery, 'sms');
  const emailDeliveryStatus = buildDeliveryStatus(emailDelivery, 'email');

  await repository.logAuditEvent(user.id, 'BUYER_REGISTERED', req, {
    phone,
    email,
    buyerType: data.buyerType
  });
  await repository.logActivityEvent(user.id, 'BUYER_REGISTERED', req, {
    role: user.role,
    entityType: 'user',
    entityId: user.id,
    buyerType: data.buyerType
  });

  return withDevHints({
    ...buildAuthPayload(user, { nextStep: 'verify_email' }),
    message: isDeliveryFailed(emailDeliveryStatus)
      ? 'Registration successful, but verification email could not be sent.'
      : 'Registration successful.',
    emailDelivery: emailDeliveryStatus,
    smsDelivery: smsDeliveryStatus
  }, smsDelivery, emailDelivery);
};

const login = async (identifier, password, rememberMe, req) => {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  let user = await repository.findUserByIdentifier(normalizedIdentifier);
  let recoveryContact = null;

  if (!user) {
    recoveryContact = await repository.findRecoveryContactByValue(normalizedIdentifier);
    if (recoveryContact) {
      user = await repository.findUserById(recoveryContact.user_id);
    }
  }

  if (!user) {
    throw new AppError('Invalid credentials', 401, ERROR_CODES.INVALID_CREDENTIALS);
  }

  if (recoveryContact && !recoveryContact.is_verified) {
    const delivery = recoveryContact.type === 'phone'
      ? await runDelivery('Recovery contact SMS', () => createOtpForUser(user, OTP_PURPOSE.LOGIN_OTP, recoveryContact.normalized_value))
      : await runDelivery('Recovery contact email', () => createVerificationEmailForTarget(user, recoveryContact.normalized_value, {
        mode: 'recovery-contact',
        type: 'email',
        value: recoveryContact.normalized_value
      }));
    await repository.logAuditEvent(user.id, 'RECOVERY_CONTACT_LOGIN_VERIFICATION_REQUIRED', req, {
      type: recoveryContact.type
    });
    return withDevHints({
      requiresRecoveryContactVerification: true,
      recoveryContactId: recoveryContact.id,
      type: recoveryContact.type,
      target: recoveryContact.type === 'phone'
        ? helpers.maskPhone(recoveryContact.value)
        : helpers.maskEmail(recoveryContact.value),
      nextStep: 'verify_recovery_contact'
    }, delivery);
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
  if (recoveryContact) {
    await repository.updateRecoveryContact(recoveryContact.id, { last_used_at: new Date().toISOString() });
  }

  const session = await createSession(refreshedUser, rememberMe);

  await repository.logAuditEvent(refreshedUser.id, 'LOGIN_SUCCESS', req, { method: 'password' });

  return {
    user: helpers.sanitizeUser(refreshedUser),
    phone: helpers.maskPhone(refreshedUser.phone),
    email: refreshedUser.email ? helpers.maskEmail(refreshedUser.email) : null,
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    nextStep: helpers.getNextStep(refreshedUser)
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

  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    throw new AppError('Account temporarily locked', 403, ERROR_CODES.ACCOUNT_LOCKED);
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

  const nextStep = helpers.getNextStep(updatedUser);
  const payload = {
    message: 'Email verified successfully',
    user: helpers.sanitizeUser(updatedUser),
    phone: helpers.maskPhone(updatedUser.phone),
    email: updatedUser.email ? helpers.maskEmail(updatedUser.email) : null,
    nextStep
  };

  if (nextStep === 'dashboard' || nextStep === 'verify_identity') {
    const session = await createSession(updatedUser);
    payload.accessToken = session.accessToken;
    payload.refreshToken = session.refreshToken;
  }

  return payload;
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

  const smsDelivery = await runDelivery(
    'Phone OTP SMS',
    () => createOtpForUser(user, purpose || OTP_PURPOSE.PHONE_VERIFICATION)
  );
  const smsDeliveryStatus = buildDeliveryStatus(smsDelivery, 'sms');

  if (isDeliveryFailed(smsDeliveryStatus)) {
    throw new AppError(smsDeliveryStatus.message, 502, ERROR_CODES.SMS_DELIVERY_FAILED, {
      smsDelivery: smsDeliveryStatus
    });
  }

  await repository.logAuditEvent(user.id, 'OTP_SENT', req, {
    purpose: purpose || OTP_PURPOSE.PHONE_VERIFICATION
  });

  return withDevHints({
    success: true,
    phone: helpers.maskPhone(user.phone),
    expiresIn: env.OTP_EXPIRES_MINUTES * 60,
    smsDelivery: smsDeliveryStatus
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

  const nextStep = helpers.getNextStep(updatedUser);

  if (nextStep === 'dashboard' || nextStep === 'verify_identity') {
    const session = await createSession(updatedUser);

    return {
      verified: true,
      message: 'Phone verified successfully',
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      user: helpers.sanitizeUser(updatedUser),
      phone: helpers.maskPhone(updatedUser.phone),
      email: updatedUser.email ? helpers.maskEmail(updatedUser.email) : null,
      nextStep
    };
  }

  return {
    verified: true,
    message: nextStep === 'pending_review'
      ? 'Phone verified successfully. Your account is now under review.'
      : 'Phone verified successfully. Please continue verification.',
    user: helpers.sanitizeUser(updatedUser),
    phone: helpers.maskPhone(updatedUser.phone),
    email: updatedUser.email ? helpers.maskEmail(updatedUser.email) : null,
    nextStep
  };
};

const forgotPassword = async (identifier, method, req) => {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  let user = await repository.findUserByIdentifier(normalizedIdentifier);
  let recoveryContact = null;

  if (!user) {
    recoveryContact = await repository.findRecoveryContactByValue(normalizedIdentifier);
    if (recoveryContact) {
      user = await repository.findUserById(recoveryContact.user_id);
    }
  }

  if (!user) {
    return { message: 'If an account exists, a reset option has been sent' };
  }

  if (recoveryContact && !recoveryContact.is_verified) {
    const delivery = recoveryContact.type === 'phone'
      ? await runDelivery('Recovery contact verification SMS', () => createOtpForUser(user, OTP_PURPOSE.PASSWORD_RESET, recoveryContact.normalized_value))
      : await runDelivery('Recovery contact verification email', () => createVerificationEmailForTarget(user, recoveryContact.normalized_value, {
        mode: 'recovery-contact',
        type: 'email',
        value: recoveryContact.normalized_value
      }));
    await repository.logAuditEvent(user.id, 'RECOVERY_CONTACT_RESET_VERIFICATION_REQUIRED', req, {
      type: recoveryContact.type
    });
    return withDevHints({
      message: 'Verify this recovery contact before using it for account recovery',
      requiresRecoveryContactVerification: true,
      recoveryContactId: recoveryContact.id,
      type: recoveryContact.type,
      target: recoveryContact.type === 'phone'
        ? helpers.maskPhone(recoveryContact.value)
        : helpers.maskEmail(recoveryContact.value),
      nextStep: 'verify_recovery_contact'
    }, delivery);
  }

  let delivery = null;
  let target = null;
  let deliveryStatus = null;

  if (method === 'sms') {
    const phoneTarget = recoveryContact?.type === 'phone' ? recoveryContact.normalized_value : user.phone;
    delivery = await runDelivery(
      'Password reset SMS',
      () => createOtpForUser(user, OTP_PURPOSE.PASSWORD_RESET, phoneTarget)
    );
    deliveryStatus = buildDeliveryStatus(delivery, 'sms');
    if (isDeliveryFailed(deliveryStatus)) {
      throw new AppError(deliveryStatus.message, 502, ERROR_CODES.SMS_DELIVERY_FAILED, {
        smsDelivery: deliveryStatus
      });
    }
    target = helpers.maskPhone(phoneTarget);
  } else if (method === 'email' && (recoveryContact?.type === 'email' || user.email)) {
    const emailTarget = recoveryContact?.type === 'email' ? recoveryContact.normalized_value : user.email;
    delivery = await runDelivery(
      'Password reset email',
      () => createPasswordResetEmailForTarget(user, emailTarget)
    );
    deliveryStatus = buildDeliveryStatus(delivery, 'email');
    if (isDeliveryFailed(deliveryStatus)) {
      throw new AppError(deliveryStatus.message, 502, ERROR_CODES.EMAIL_DELIVERY_FAILED, {
        emailDelivery: deliveryStatus
      });
    }
    target = helpers.maskEmail(emailTarget);
  }

  await repository.logAuditEvent(user.id, 'PASSWORD_RESET_REQUESTED', req, { method });

  return withDevHints({
    message: 'If an account exists, a reset option has been sent',
    identifier: normalizedIdentifier,
    method,
    target,
    ...(method === 'sms' && deliveryStatus ? { smsDelivery: deliveryStatus } : {}),
    ...(method === 'email' && deliveryStatus ? { emailDelivery: deliveryStatus } : {}),
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
      const normalized = normalizeIdentifier(payload.identifier);
      user = await repository.findUserByIdentifier(normalized);
      if (!user) {
        const recoveryContact = await repository.findRecoveryContactByValue(normalized);
        if (recoveryContact?.is_verified) {
          user = await repository.findUserById(recoveryContact.user_id);
        }
      }
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

    const emailDelivery = await runDelivery(
      'Email verification resend',
      () => createEmailVerificationForUser(user)
    );
    const emailDeliveryStatus = buildDeliveryStatus(emailDelivery, 'email');

    if (isDeliveryFailed(emailDeliveryStatus)) {
      throw new AppError(emailDeliveryStatus.message, 502, ERROR_CODES.EMAIL_DELIVERY_FAILED, {
        emailDelivery: emailDeliveryStatus
      });
    }

    await repository.logAuditEvent(user.id, 'EMAIL_VERIFICATION_RESENT', req, {});

    return withDevHints({
      target: helpers.maskEmail(user.email),
      nextStep: 'verify_email',
      emailDelivery: emailDeliveryStatus
    }, emailDelivery);
  }

  const smsDelivery = await runDelivery(
    'Phone verification resend',
    () => createOtpForUser(user, OTP_PURPOSE.PHONE_VERIFICATION)
  );
  const smsDeliveryStatus = buildDeliveryStatus(smsDelivery, 'sms');

  if (isDeliveryFailed(smsDeliveryStatus)) {
    throw new AppError(smsDeliveryStatus.message, 502, ERROR_CODES.SMS_DELIVERY_FAILED, {
      smsDelivery: smsDeliveryStatus
    });
  }

  await repository.logAuditEvent(user.id, 'PHONE_VERIFICATION_RESENT', req, {});

  return withDevHints({
    target: helpers.maskPhone(user.phone),
    nextStep: 'verify_phone',
    smsDelivery: smsDeliveryStatus
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
  } else if (user.role === USER_ROLES.RESELLER) {
    result.profile = await repository.getResellerProfile(userId);
  } else if (user.role === USER_ROLES.LOCAL_BUYER || user.role === USER_ROLES.INTERNATIONAL_BUYER) {
    result.profile = await repository.getBuyerProfile(userId);
  }

  return result;
};

const updateMe = async (userId, updateData) => {
  const allowedUserFields = ['first_name', 'last_name', 'region', 'city', 'country', 'profile_image_url'];
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
  } else if (user.role === USER_ROLES.RESELLER) {
    const allowedProfileFields = [
      'business_name',
      'about',
      'primary_crop',
      'crops_sold',
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
      await repository.updateResellerProfile(userId, profileUpdates);
    }
    result.profile = await repository.getResellerProfile(userId);
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

const changePassword = async (userId, payload, req) => {
  const user = await repository.findUserById(userId);
  if (!user) {
    throw new AppError('User not found', 404, ERROR_CODES.ACCOUNT_NOT_FOUND);
  }

  const valid = await bcrypt.compare(payload.currentPassword, user.password_hash || '');
  if (!valid) {
    throw new AppError('Current password is incorrect', 401, ERROR_CODES.INVALID_CREDENTIALS);
  }

  const passwordHash = await bcrypt.hash(payload.newPassword, env.BCRYPT_SALT_ROUNDS);
  await repository.updateUser(userId, { password_hash: passwordHash });
  await repository.deleteUserTokens(userId, TOKEN_TYPE.REFRESH_TOKEN);
  await repository.logAuditEvent(userId, 'PASSWORD_CHANGED', req, {});
  return { changed: true };
};

const requestContactChange = async (userId, payload, req) => {
  const user = await repository.findUserById(userId);
  if (!user) throw new AppError('User not found', 404, ERROR_CODES.ACCOUNT_NOT_FOUND);

  const normalizedValue = normalizeContactValue(payload.type, payload.value);
  if (payload.type === 'email' && await repository.findUserByEmail(normalizedValue)) {
    throw new AppError('Email is already in use', 409, ERROR_CODES.DUPLICATE_EMAIL);
  }
  if (payload.type === 'phone' && await repository.findUserByPhone(normalizedValue)) {
    throw new AppError('Phone number is already in use', 409, ERROR_CODES.DUPLICATE_PHONE);
  }

  const change = await repository.createContactChange({
    user_id: userId,
    type: payload.type,
    old_value: payload.type === 'email' ? user.email : user.phone,
    new_value: payload.value,
    normalized_value: normalizedValue,
    status: 'pending'
  });

  const delivery = payload.type === 'phone'
    ? await runDelivery('Primary phone change OTP', () => createOtpForUser(user, OTP_PURPOSE.PHONE_VERIFICATION, normalizedValue))
    : await runDelivery('Primary email change verification', () => createVerificationEmailForTarget(user, normalizedValue, {
      mode: 'contact-change',
      type: 'email',
      value: normalizedValue
    }));

  await repository.logAuditEvent(userId, 'CONTACT_CHANGE_REQUESTED', req, {
    type: payload.type,
    changeId: change.id
  });

  return withDevHints({
    id: change.id,
    type: payload.type,
    target: payload.type === 'email' ? helpers.maskEmail(normalizedValue) : helpers.maskPhone(normalizedValue),
    nextStep: payload.type === 'email' ? 'verify_email' : 'verify_phone'
  }, delivery);
};

const confirmContactChange = async (userId, payload, req) => {
  const normalizedValue = payload.value ? normalizeContactValue(payload.type, payload.value) : null;
  const change = await repository.findPendingContactChange(userId, payload.type, normalizedValue);
  if (!change) {
    throw new AppError('Pending contact change not found', 404, ERROR_CODES.NOT_FOUND);
  }

  if (payload.type === 'phone') {
    const otp = await repository.findLatestOtp(userId, OTP_PURPOSE.PHONE_VERIFICATION);
    if (!otp || new Date(otp.expires_at) < new Date()) {
      throw new AppError('OTP not found or expired', 400, ERROR_CODES.OTP_INVALID);
    }
    await repository.incrementOtpAttempts(otp.id);
    if (!await otpUtil.verifyOtp(payload.otp, otp.otp_hash)) {
      throw new AppError('Invalid OTP', 400, ERROR_CODES.OTP_INVALID);
    }
    await repository.markOtpVerified(otp.id);
  } else if (payload.token) {
    const tokenHash = tokenHelper.hashToken(payload.token);
    const tokenRecord = await repository.findToken(tokenHash, TOKEN_TYPE.PASSWORD_RESET);
    if (!tokenRecord || tokenRecord.user_id !== userId) {
      throw new AppError('Invalid or expired verification token', 400, ERROR_CODES.TOKEN_INVALID);
    }
    await repository.markTokenUsed(tokenRecord.id);
  } else {
    throw new AppError('Verification token is required', 400, ERROR_CODES.VALIDATION_ERROR);
  }

  const userUpdate = payload.type === 'email'
    ? { email: change.normalized_value, email_verified: true }
    : { phone: change.normalized_value, phone_verified: true };
  const updatedUser = await repository.updateUser(userId, userUpdate);
  await repository.updateContactChange(change.id, {
    status: 'verified',
    verified_at: new Date().toISOString()
  });
  await repository.logAuditEvent(userId, 'CONTACT_CHANGE_VERIFIED', req, { type: payload.type });

  return {
    user: helpers.sanitizeUser(updatedUser),
    type: payload.type,
    verified: true
  };
};

const listRecoveryContacts = async (userId) => {
  const items = await repository.listRecoveryContacts(userId);
  return {
    items: items.map(mapRecoveryContact),
    count: items.length
  };
};

const addRecoveryContact = async (userId, payload, req) => {
  const user = await repository.findUserById(userId);
  const normalizedValue = normalizeContactValue(payload.type, payload.value);

  if (payload.type === 'email' && normalizedValue === user.email) {
    throw new AppError('Use a different recovery email from your primary email', 400, ERROR_CODES.VALIDATION_ERROR);
  }
  if (payload.type === 'phone' && normalizedValue === user.phone) {
    throw new AppError('Use a different recovery phone from your primary phone', 400, ERROR_CODES.VALIDATION_ERROR);
  }

  const existing = await repository.findRecoveryContactByValue(normalizedValue);
  if (existing && existing.user_id !== userId) {
    throw new AppError('Recovery contact is already in use', 409, ERROR_CODES.VALIDATION_ERROR);
  }

  const contact = await repository.upsertRecoveryContact({
    user_id: userId,
    type: payload.type,
    value: payload.value,
    normalized_value: normalizedValue,
    is_verified: false
  });
  await repository.logAuditEvent(userId, 'RECOVERY_CONTACT_ADDED', req, { type: payload.type });
  return mapRecoveryContact(contact);
};

const confirmRecoveryContact = async (userId, payload, req) => {
  const normalizedValue = normalizeContactValue(payload.type, payload.value);
  const contact = await repository.findRecoveryContactByValue(normalizedValue);
  if (!contact || contact.user_id !== userId) {
    throw new AppError('Recovery contact not found', 404, ERROR_CODES.NOT_FOUND);
  }

  if (payload.type === 'phone') {
    const otp = await repository.findLatestOtp(userId, OTP_PURPOSE.LOGIN_OTP);
    if (!otp || new Date(otp.expires_at) < new Date()) {
      throw new AppError('OTP not found or expired', 400, ERROR_CODES.OTP_INVALID);
    }
    await repository.incrementOtpAttempts(otp.id);
    if (!await otpUtil.verifyOtp(payload.otp, otp.otp_hash)) {
      throw new AppError('Invalid OTP', 400, ERROR_CODES.OTP_INVALID);
    }
    await repository.markOtpVerified(otp.id);
  } else if (payload.token) {
    const tokenHash = tokenHelper.hashToken(payload.token);
    const tokenRecord = await repository.findToken(tokenHash, TOKEN_TYPE.PASSWORD_RESET);
    if (!tokenRecord || tokenRecord.user_id !== userId) {
      throw new AppError('Invalid or expired verification token', 400, ERROR_CODES.TOKEN_INVALID);
    }
    await repository.markTokenUsed(tokenRecord.id);
  }

  const updated = await repository.updateRecoveryContact(contact.id, {
    is_verified: true,
    verified_at: new Date().toISOString()
  });
  await repository.logAuditEvent(userId, 'RECOVERY_CONTACT_VERIFIED', req, { type: payload.type });
  return mapRecoveryContact(updated);
};

const confirmRecoveryContactPublic = async (payload, req) => {
  const normalizedValue = normalizeContactValue(payload.type, payload.value);
  const contact = await repository.findRecoveryContactByValue(normalizedValue);
  if (!contact) {
    throw new AppError('Recovery contact not found', 404, ERROR_CODES.NOT_FOUND);
  }

  if (payload.type === 'phone') {
    const otp = await repository.findLatestOtp(contact.user_id, OTP_PURPOSE.LOGIN_OTP);
    if (!otp || new Date(otp.expires_at) < new Date()) {
      throw new AppError('OTP not found or expired', 400, ERROR_CODES.OTP_INVALID);
    }
    await repository.incrementOtpAttempts(otp.id);
    if (!await otpUtil.verifyOtp(payload.otp, otp.otp_hash)) {
      throw new AppError('Invalid OTP', 400, ERROR_CODES.OTP_INVALID);
    }
    await repository.markOtpVerified(otp.id);
  } else if (payload.token) {
    const tokenHash = tokenHelper.hashToken(payload.token);
    const tokenRecord = await repository.findToken(tokenHash, TOKEN_TYPE.PASSWORD_RESET);
    if (!tokenRecord || tokenRecord.user_id !== contact.user_id) {
      throw new AppError('Invalid or expired verification token', 400, ERROR_CODES.TOKEN_INVALID);
    }
    await repository.markTokenUsed(tokenRecord.id);
  } else {
    throw new AppError('Verification token is required', 400, ERROR_CODES.VALIDATION_ERROR);
  }

  const updated = await repository.updateRecoveryContact(contact.id, {
    is_verified: true,
    verified_at: new Date().toISOString()
  });
  await repository.logAuditEvent(contact.user_id, 'RECOVERY_CONTACT_VERIFIED_PUBLIC', req, { type: payload.type });
  return {
    contact: mapRecoveryContact(updated),
    nextStep: 'sign_in'
  };
};

const deleteRecoveryContact = async (userId, contactId, req) => {
  await repository.deleteRecoveryContact(userId, contactId);
  await repository.logAuditEvent(userId, 'RECOVERY_CONTACT_DELETED', req, {});
  return { id: contactId, deleted: true };
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

const getUploadedFile = (files, field) => {
  const value = files?.[field];
  return Array.isArray(value) ? value[0] : null;
};

const extensionForFile = (file) => {
  const fromName = path.extname(file.originalname || '').toLowerCase();
  if (fromName) return fromName;
  if (file.mimetype === 'image/png') return '.png';
  if (file.mimetype === 'image/webp') return '.webp';
  return '.jpg';
};

const uploadVerificationFile = async (userId, field, file) => {
  const bucket = env.SUPABASE_VERIFICATION_BUCKET;
  const storagePath = `${userId}/${Date.now()}-${field}${extensionForFile(file)}`;
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true
    });

  if (error) {
    throw new AppError(
      `Verification upload failed. Confirm the private Supabase bucket "${bucket}" exists and is not public.`,
      500,
      ERROR_CODES.SERVER_ERROR,
      { storage: error.message }
    );
  }

  return storagePath;
};

const submitIdentityVerification = async (userId, data, req) => {
  const user = await repository.findUserById(userId);
  if (!user || ![USER_ROLES.FARMER, USER_ROLES.RESELLER].includes(user.role)) {
    throw new AppError('Only sellers can submit identity verification', 400, ERROR_CODES.VALIDATION_ERROR);
  }

  const idFront = getUploadedFile(req.files, 'idFront');
  const idBack = getUploadedFile(req.files, 'idBack');
  const selfie = getUploadedFile(req.files, 'selfie');

  if (!idFront || !idBack || !selfie) {
    throw new AppError(
      'National ID front, National ID back, and live selfie images are required.',
      400,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  const [idFrontPath, idBackPath, selfiePath] = await Promise.all([
    uploadVerificationFile(userId, 'id-front', idFront),
    uploadVerificationFile(userId, 'id-back', idBack),
    uploadVerificationFile(userId, 'selfie', selfie)
  ]);

  const updates = {
    id_front_storage_path: idFrontPath,
    id_back_storage_path: idBackPath,
    selfie_storage_path: selfiePath,
    id_front_url: null,
    id_back_url: null,
    selfie_url: null,
    identity_verification_status: FARMER_VERIFICATION_STATUS.PENDING_REVIEW,
    verification_submitted_at: new Date().toISOString(),
    rejection_reason: null
  };

  if (user.role === USER_ROLES.RESELLER) {
    await repository.updateResellerProfile(userId, updates);
  } else {
    await repository.updateFarmerProfile(userId, updates);
  }
  await repository.updateUser(userId, { status: USER_STATUS.PENDING_REVIEW });

  await repository.logAuditEvent(userId, 'IDENTITY_VERIFICATION_SUBMITTED', req, {});

  return {
    message: 'Identity verification submitted successfully. Your account is now under review.',
    status: USER_STATUS.PENDING_REVIEW,
    nextStep: 'pending_review'
  };
};

const adminReviewUser = async (adminId, userId, action, reason, req) => {
  const user = await repository.findUserById(userId);
  if (!user) {
    throw new AppError('User not found', 404, ERROR_CODES.ACCOUNT_NOT_FOUND);
  }

  let nextStatus;
  const farmerProfileUpdate = {};
  switch (action) {
    case 'approve':
      nextStatus = USER_STATUS.ACTIVE;
      farmerProfileUpdate.identity_verification_status = FARMER_VERIFICATION_STATUS.VERIFIED;
      farmerProfileUpdate.verified_by = adminId;
      farmerProfileUpdate.verified_at = new Date().toISOString();
      farmerProfileUpdate.rejection_reason = null;
      break;
    case 'reject':
      nextStatus = USER_STATUS.PENDING_IDENTITY_VERIFICATION;
      farmerProfileUpdate.identity_verification_status = FARMER_VERIFICATION_STATUS.REJECTED;
      farmerProfileUpdate.rejection_reason = reason || 'Rejected by admin review';
      break;
    case 'flag':
      nextStatus = USER_STATUS.PENDING_IDENTITY_VERIFICATION;
      farmerProfileUpdate.identity_verification_status = FARMER_VERIFICATION_STATUS.REJECTED;
      farmerProfileUpdate.rejection_reason = reason || 'Additional verification is required';
      break;
    case 'ban':
      nextStatus = USER_STATUS.SUSPENDED;
      await repository.updateUser(userId, { 
        banned_at: new Date().toISOString(),
        ban_reason: reason || 'Banned by admin for misbehavior'
      });
      break;
    default:
      throw new AppError('Invalid review action', 400, ERROR_CODES.VALIDATION_ERROR);
  }

  const userUpdate = { status: nextStatus };
  if (['approve', 'reject'].includes(action)) {
    userUpdate.reviewed_at = new Date().toISOString();
  }

  await repository.updateUser(userId, userUpdate);
  
  if (user.role === USER_ROLES.FARMER && Object.keys(farmerProfileUpdate).length > 0) {
    await repository.updateFarmerProfile(userId, farmerProfileUpdate);
  } else if (user.role === USER_ROLES.RESELLER && Object.keys(farmerProfileUpdate).length > 0) {
    await repository.updateResellerProfile(userId, farmerProfileUpdate);
  }

  await repository.logAuditEvent(userId, `USER_${action.toUpperCase()}`, req, { adminId, reason });
  await repository.logActivityEvent(userId, `USER_${action.toUpperCase()}`, req, {
    adminId,
    reason,
    role: user.role,
    entityType: 'user',
    entityId: userId
  });

  return {
    message: `User ${action}ed successfully`,
    status: nextStatus
  };
};

const getPendingUsers = async () => {
  const users = await repository.findUsersByStatus(USER_STATUS.PENDING_REVIEW);
  return users
    .filter((user) => user.role === USER_ROLES.FARMER)
    .concat(users.filter((user) => user.role === USER_ROLES.RESELLER))
    .map((user) => ({
      ...user,
      name: formatUserName(user),
      profile: user.role === USER_ROLES.RESELLER
        ? (Array.isArray(user.reseller_profiles) ? user.reseller_profiles[0] : user.reseller_profiles)
        : (Array.isArray(user.farmer_profiles) ? user.farmer_profiles[0] : user.farmer_profiles)
    }));
};

module.exports = {
  oauthExchange,
  registerFarmer,
  registerReseller,
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
  changePassword,
  requestContactChange,
  confirmContactChange,
  listRecoveryContacts,
  addRecoveryContact,
  confirmRecoveryContact,
  confirmRecoveryContactPublic,
  deleteRecoveryContact,
  deactivateAccount,
  submitIdentityVerification,
  adminReviewUser,
  getPendingUsers
};
