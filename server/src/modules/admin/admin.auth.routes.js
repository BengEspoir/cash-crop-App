const router = require('express').Router();
const { authLimiter } = require('../../middleware/rateLimiter');
const { authenticate, authorize, requireActiveAccount } = require('../../middleware/auth');
const { adminLogin } = require('./admin.auth.controller');
const { adminReviewUser, getPendingUsers } = require('../auth/auth.controller');

router.post('/authenticate', authLimiter, adminLogin);
router.get('/pending-users', authenticate, requireActiveAccount, authorize('admin', 'super_admin'), getPendingUsers);
router.post('/review-user', authenticate, requireActiveAccount, authorize('admin', 'super_admin'), adminReviewUser);

module.exports = router;
