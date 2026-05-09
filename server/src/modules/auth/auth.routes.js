const router = require('express').Router();
const validate = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth');
const { identityUpload } = require('../../middleware/upload');
const { authLimiter, otpSendLimiter, passwordResetLimiter } = require('../../middleware/rateLimiter');

const {
  registerFarmerSchema,
  registerResellerSchema,
  registerBuyerSchema,
  loginSchema,
  sendOtpSchema,
  confirmOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} = require('./auth.validators');

const {
  registerFarmer,
  registerReseller,
  registerBuyer,
  login,
  logout,
  refreshToken,
  verifyEmail,
  sendPhoneOtp,
  confirmPhoneOtp,
  forgotPassword,
  resetPassword,
  resendVerification,
  getMe,
  updateMe,
  deactivateAccount,
  submitIdentityVerification
} = require('./auth.controller');

router.post('/register/farmer', authLimiter, validate(registerFarmerSchema), registerFarmer);
router.post('/register/reseller', authLimiter, validate(registerResellerSchema), registerReseller);
router.post('/register/buyer', authLimiter, validate(registerBuyerSchema), registerBuyer);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', authenticate, logout);
router.post('/refresh-token', refreshToken);
router.post('/verify-email', verifyEmail);
router.post('/verify-phone/send', otpSendLimiter, validate(sendOtpSchema), sendPhoneOtp);
router.post('/verify-phone/confirm', validate(confirmOtpSchema), confirmPhoneOtp);
router.post('/forgot-password', passwordResetLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.post('/resend-verification', otpSendLimiter, resendVerification);
router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, updateMe);
router.post('/submit-identity', authenticate, identityUpload, submitIdentityVerification);
router.delete('/me', authenticate, deactivateAccount);

module.exports = router;
