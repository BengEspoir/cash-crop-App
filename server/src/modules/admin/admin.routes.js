const router = require('express').Router();
const { authenticate, authorize, requireActiveAccount } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { adminReviewUser, getPendingUsers } = require('../auth/auth.controller');
const {
  getActivity,
  getAuditLogs,
  listVerificationSubmissions,
  getVerificationSubmission,
  reviewVerificationSubmission
  ,suspendUser
  ,restoreUser
} = require('./admin.controller');
const {
  getMaintenance,
  enableMaintenance,
  disableMaintenance,
  getDatabaseCapability,
  listDatabaseJobs,
  getDatabaseJob,
  requestBackup,
  requestRestore
} = require('../system/system.controller');
const { maintenanceSchema, restoreSchema } = require('../system/system.validators');
const { accountModerationSchema } = require('./admin.validators');

router.use(authenticate, requireActiveAccount, authorize('admin', 'super_admin'));

router.get('/pending-users', getPendingUsers);
router.post('/review-user', adminReviewUser);
router.get('/verification-submissions', listVerificationSubmissions);
router.get('/verification-submissions/:userId', getVerificationSubmission);
router.post('/verification-submissions/:userId/review', reviewVerificationSubmission);
router.post('/users/:userId/suspend', validate(accountModerationSchema), suspendUser);
router.post('/users/:userId/restore', validate(accountModerationSchema), restoreUser);
router.get('/activity', getActivity);
router.get('/audit-logs', getAuditLogs);
router.get('/maintenance', getMaintenance);
router.post('/maintenance/enable', validate(maintenanceSchema), enableMaintenance);
router.post('/maintenance/disable', validate(maintenanceSchema), disableMaintenance);
router.get('/backups/capability', getDatabaseCapability);
router.get('/backups', listDatabaseJobs);
router.get('/backups/:id', getDatabaseJob);
router.post('/backups', requestBackup);
router.post('/restores', validate(restoreSchema), requestRestore);

module.exports = router;
