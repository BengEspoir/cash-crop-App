const router = require('express').Router();
const { authenticate, authorize, requireActiveAccount, requireDashboardAccess } = require('../../middleware/auth');
const {
  getFarmerDashboard,
  getBuyerDashboard,
  getAdminDashboard
} = require('./dashboard.controller');

router.get('/farmer', authenticate, requireDashboardAccess, authorize('farmer'), getFarmerDashboard);
router.get('/buyer', authenticate, requireDashboardAccess, authorize('local_buyer', 'international_buyer'), getBuyerDashboard);
router.get('/admin', authenticate, requireActiveAccount, authorize('admin', 'super_admin'), getAdminDashboard);

module.exports = router;
