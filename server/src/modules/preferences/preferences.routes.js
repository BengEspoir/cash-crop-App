const router = require('express').Router();
const validate = require('../../middleware/validate');
const { authenticate, requireDashboardAccess } = require('../../middleware/auth');
const {
  getDashboardPreferences,
  updateDashboardPreferences
} = require('./preferences.controller');
const { updateDashboardPreferencesSchema } = require('./preferences.validators');

router.use(authenticate, requireDashboardAccess);

router.get('/dashboard', getDashboardPreferences);
router.put('/dashboard', validate(updateDashboardPreferencesSchema), updateDashboardPreferences);

module.exports = router;
