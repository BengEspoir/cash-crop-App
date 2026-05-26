const router = require('express').Router();
const { authenticate, authorize, requireActiveAccount, requireDashboardAccess } = require('../../middleware/auth');
const {
  getFarmerDashboard,
  getBuyerDashboard,
  getAdminDashboard,
  exportFarmerDashboard,
  exportBuyerDashboard,
  exportAdminDashboard
} = require('./dashboard.controller');

router.get('/farmer', authenticate, requireDashboardAccess, authorize('farmer'), getFarmerDashboard);
router.get('/farmer/export', authenticate, requireDashboardAccess, authorize('farmer'), exportFarmerDashboard);
router.get('/buyer', authenticate, requireDashboardAccess, authorize('local_buyer', 'international_buyer'), getBuyerDashboard);
router.get('/buyer/export', authenticate, requireDashboardAccess, authorize('local_buyer', 'international_buyer'), exportBuyerDashboard);
router.get('/admin', authenticate, requireActiveAccount, authorize('admin', 'super_admin'), getAdminDashboard);
router.get('/admin/export', authenticate, requireActiveAccount, authorize('admin', 'super_admin'), exportAdminDashboard);

module.exports = router;
