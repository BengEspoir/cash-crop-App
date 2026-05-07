const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/supabase');
const env = require('../config/env');
const { sendError } = require('../utils/response');
const { ERROR_CODES, USER_STATUS } = require('../config/constants');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Access token required', 401, ERROR_CODES.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    
    try {
      decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return sendError(res, 'Token expired', 401, ERROR_CODES.TOKEN_EXPIRED);
      }
      return sendError(res, 'Invalid token', 401, ERROR_CODES.TOKEN_INVALID);
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, role, status, phone_verified, email_verified, locked_until')
      .eq('id', decoded.id)
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

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    
    try {
      decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    } catch {
      req.user = null;
      return next();
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, role, status, phone_verified, email_verified, locked_until')
      .eq('id', decoded.id)
      .single();

    if (
      error ||
      !user ||
      [USER_STATUS.DEACTIVATED, USER_STATUS.SUSPENDED, USER_STATUS.REJECTED].includes(user.status) ||
      (user.locked_until && new Date(user.locked_until) > new Date())
    ) {
      req.user = null;
    } else {
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
  restrictUnverifiedFarmer,
  optionalAuth
};
