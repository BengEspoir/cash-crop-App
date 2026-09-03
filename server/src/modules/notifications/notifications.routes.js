const router = require('express').Router();
const validate = require('../../middleware/validate');
const { authenticate, requireDashboardAccess } = require('../../middleware/auth');
const {
  listNotifications,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
  subscribePush,
  unsubscribePush
} = require('./notifications.controller');
const { createNotificationSchema, pushSubscriptionSchema, pushUnsubscribeSchema } = require('./notifications.validators');

router.use(authenticate, requireDashboardAccess);

router.get('/', listNotifications);
router.post('/', validate(createNotificationSchema), createNotification);
router.post('/push/subscribe', validate(pushSubscriptionSchema), subscribePush);
router.post('/push/unsubscribe', validate(pushUnsubscribeSchema), unsubscribePush);
router.patch('/read-all', markAllNotificationsRead);
router.patch('/:id/read', markNotificationRead);

module.exports = router;
