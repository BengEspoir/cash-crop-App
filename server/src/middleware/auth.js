const { supabaseAdmin, createUserScopedClient } = require('../config/supabase');
const { sendError } = require('../utils/response');
const { ERROR_CODES, USER_STATUS } = require('../config/constants');
const { isSellerRole, getSellerProfileTable, isVerifiedSellerProfile } = require('../utils/marketplace');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Access token required', 401, ERROR_CODES.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authData?.user) {
      return sendError(res, 'Invalid or expired Supabase session', 401, ERROR_CODES.TOKEN_INVALID);
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, role, status, phone_verified, email_verified, locked_until')
      .eq('auth_user_id', authData.user.id)
      .single();

    if (error || !user) {
      return sendError(res, 'User not found', 401, ERROR_CODES.UNAUTHORIZED);
    }

    if (user.status === USER_STATUS.DEACTIVATED) {
      return sendError(res, 'Account deactivated', 401, ERROR_CODES.UNAUTHORIZED);
    }

    if (user.status === USER_STATUS.SUSPENDED) {
      return sendError(res, 'Account suspended', 403, ERROR_CODES.ACCOUNT_SUSPENDED);
    }

    if (user.status === USER_STATUS.REJECTED) {
      return sendError(res, 'Account rejected', 403, ERROR_CODES.ACCOUNT_SUSPENDED);
    }

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return sendError(res, 'Account temporarily locked', 403, ERROR_CODES.ACCOUNT_LOCKED);
    }

    req.auth = { authUserId: authData.user.id, accessToken: token, claims: authData.user.app_metadata || {} };
    req.db = createUserScopedClient(token);
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

const requireActiveAccount = (req, res, next) => {
  if (!req.user) {
    return sendError(res, 'Authentication required', 401, ERROR_CODES.UNAUTHORIZED);
  }

  if (req.user.status !== USER_STATUS.ACTIVE) {
    return sendError(res, 'Account is not active yet', 403, ERROR_CODES.ACCOUNT_PENDING);
  }

  next();
};

const requireDashboardAccess = (req, res, next) => {
  if (!req.user) {
    return sendError(res, 'Authentication required', 401, ERROR_CODES.UNAUTHORIZED);
  }

  if (!req.user.email_verified) {
    return sendError(res, 'Email verification required', 403, ERROR_CODES.EMAIL_NOT_VERIFIED);
  }

  next();
};

const requireMarketplaceAccess = (req, res, next) => {
  if (!req.user) {
    return sendError(res, 'Authentication required', 401, ERROR_CODES.UNAUTHORIZED);
  }

  if (!req.user.email_verified) {
    return sendError(res, 'Email verification required', 403, ERROR_CODES.EMAIL_NOT_VERIFIED);
  }

  if (!req.user.phone_verified) {
    return sendError(
      res,
      'Verify your phone number to continue this marketplace action.',
      403,
      ERROR_CODES.PHONE_NOT_VERIFIED
    );
  }

  next();
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401, ERROR_CODES.UNAUTHORIZED);
    }
    
    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Insufficient permissions', 403, ERROR_CODES.FORBIDDEN);
    }
    
    next();
  };
};

const restrictUnverifiedFarmer = (req, res, next) => {
  if (req.user.role === 'farmer' && req.user.status !== 'active') {
    return sendError(
      res, 
      'please verify your profile, before performing any action', 
      403, 
      ERROR_CODES.FORBIDDEN
    );
  }
  next();
};

const requireVerifiedFarmerForCommerce = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401, ERROR_CODES.UNAUTHORIZED);
    }

    if (!isSellerRole(req.user.role)) {
      return next();
    }

    const profileTable = getSellerProfileTable(req.user.role);
    const { data: profile, error } = await supabaseAdmin
      .from(profileTable)
      .select('identity_verification_status, verified_at')
      .eq('user_id', req.user.id)
      .single();

    if (error || !isVerifiedSellerProfile(profile, req.user)) {
      return sendError(
        res,
        'You must complete National ID verification before accepting sales or receiving payments.',
        403,
        ERROR_CODES.FORBIDDEN
      );
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authData?.user) {
      req.user = null;
      return next();
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, role, status, phone_verified, email_verified, locked_until')
      .eq('auth_user_id', authData.user.id)
      .single();

    if (
      error ||
      !user ||
      [USER_STATUS.DEACTIVATED, USER_STATUS.SUSPENDED, USER_STATUS.REJECTED].includes(user.status) ||
      (user.locked_until && new Date(user.locked_until) > new Date())
    ) {
      req.user = null;
    } else {
      req.auth = { authUserId: authData.user.id, accessToken: token, claims: authData.user.app_metadata || {} };
      req.db = createUserScopedClient(token);
      req.user = user;
    }
    
    next();
  } catch {
    req.user = null;
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  requireActiveAccount,
  requireDashboardAccess,
  requireMarketplaceAccess,
  restrictUnverifiedFarmer,
  requireVerifiedFarmerForCommerce,
  optionalAuth
};
