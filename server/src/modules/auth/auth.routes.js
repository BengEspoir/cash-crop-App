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
  resetPasswordSchema,
  updateMeSchema,
  changePasswordSchema,
  contactChangeRequestSchema,
  contactChangeConfirmSchema,
  recoveryContactSchema,
  recoveryContactConfirmSchema
} = require('./auth.validators');

const {
  registerFarmer,
  registerReseller,
  registerBuyer,
  oauthExchange,
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
  changePassword,
  requestContactChange,
  confirmContactChange,
  listRecoveryContacts,
  addRecoveryContact,
  confirmRecoveryContact,
  confirmRecoveryContactPublic,
  deleteRecoveryContact,
  deactivateAccount,
  submitIdentityVerification
} = require('./auth.controller');

router.post('/register/farmer', authLimiter, validate(registerFarmerSchema), registerFarmer);
router.post('/register/reseller', authLimiter, validate(registerResellerSchema), registerReseller);
router.post('/register/buyer', authLimiter, validate(registerBuyerSchema), registerBuyer);
router.post('/oauth/exchange', authLimiter, oauthExchange);
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
router.patch('/me', authenticate, validate(updateMeSchema), updateMe);
router.post('/me/change-password', authenticate, validate(changePasswordSchema), changePassword);
router.post('/contact-change/request', authenticate, validate(contactChangeRequestSchema), requestContactChange);
router.post('/contact-change/confirm', authenticate, validate(contactChangeConfirmSchema), confirmContactChange);
router.get('/recovery-contacts', authenticate, listRecoveryContacts);
router.post('/recovery-contacts', authenticate, validate(recoveryContactSchema), addRecoveryContact);
router.post('/recovery-contacts/confirm-public', validate(recoveryContactConfirmSchema), confirmRecoveryContactPublic);
router.post('/recovery-contacts/confirm', authenticate, validate(recoveryContactConfirmSchema), confirmRecoveryContact);
router.delete('/recovery-contacts/:id', authenticate, deleteRecoveryContact);
router.post('/submit-identity', authenticate, identityUpload, submitIdentityVerification);
router.delete('/me', authenticate, deactivateAccount);

module.exports = router;
