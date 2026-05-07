const router = require('express').Router();
const { authenticate, authorize, requireActiveAccount } = require('../../middleware/auth');
const { adminReviewUser, getPendingUsers } = require('../auth/auth.controller');
const { getActivity } = require('./admin.controller');

router.use(authenticate, requireActiveAccount, authorize('admin', 'super_admin'));

router.get('/pending-users', getPendingUsers);
router.post('/review-user', adminReviewUser);
router.get('/activity', getActivity);

module.exports = router;
