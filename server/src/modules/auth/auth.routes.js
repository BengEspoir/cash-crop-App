const router = require('express').Router();
const validate = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth');
const { identityUpload } = require('../../middleware/upload');
const { authLimiter, otpSendLimiter } = require('../../middleware/rateLimiter');

const {
  sendOtpSchema,
  confirmOtpSchema,
  updateMeSchema,
  contactChangeRequestSchema,
  contactChangeConfirmSchema,
  recoveryContactSchema,
  recoveryContactConfirmSchema,
  phonePasswordLoginSchema
} = require('./auth.validators');

const {
  sendPhoneOtp,
  confirmPhoneOtp,
  getMe,
  updateMe,
  requestContactChange,
  confirmContactChange,
  listRecoveryContacts,
  addRecoveryContact,
  confirmRecoveryContact,
  confirmRecoveryContactPublic,
  deleteRecoveryContact,
  deactivateAccount,
  submitIdentityVerification,
  loginWithPhone
} = require('./auth.controller');

router.post('/login/phone', authLimiter, validate(phonePasswordLoginSchema), loginWithPhone);
router.post('/verify-phone/send', otpSendLimiter, validate(sendOtpSchema), sendPhoneOtp);
router.post('/verify-phone/confirm', validate(confirmOtpSchema), confirmPhoneOtp);
router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, validate(updateMeSchema), updateMe);
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
