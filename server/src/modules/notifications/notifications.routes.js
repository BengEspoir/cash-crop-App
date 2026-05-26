const router = require('express').Router();
const validate = require('../../middleware/validate');
const { authenticate, requireDashboardAccess } = require('../../middleware/auth');
const {
  listNotifications,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead
} = require('./notifications.controller');
const { createNotificationSchema } = require('./notifications.validators');

router.use(authenticate, requireDashboardAccess);

router.get('/', listNotifications);
router.post('/', validate(createNotificationSchema), createNotification);
router.patch('/read-all', markAllNotificationsRead);
router.patch('/:id/read', markNotificationRead);

module.exports = router;
