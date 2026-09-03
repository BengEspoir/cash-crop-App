const AppError = require('../../utils/AppError');
const { ERROR_CODES, USER_ROLES } = require('../../config/constants');
const repository = require('./notifications.repository');
const { logAdminAudit } = require('../../utils/adminAudit');
const webpush = require('web-push');
const env = require('../../config/env');

const isAdmin = (user) => [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(user.role);
const pushConfigured = Boolean(env.WEB_PUSH_PUBLIC_KEY && env.WEB_PUSH_PRIVATE_KEY && env.WEB_PUSH_SUBJECT);

if (pushConfigured) {
  webpush.setVapidDetails(env.WEB_PUSH_SUBJECT, env.WEB_PUSH_PUBLIC_KEY, env.WEB_PUSH_PRIVATE_KEY);
}

const pushCategory = (type) => {
  if (type === 'new_message') return 'messages';
  if (type === 'payment_received') return 'payments';
  if (type === 'order_update') return 'orders';
  if (type === 'listing_approved') return 'verification';
  return 'system';
};

const safePushPayload = (notification) => JSON.stringify({
  title: 'AgriculNet update',
  body: 'Open AgriculNet to view your update.',
  url: '/notifications',
  tag: 'agriculnet-' + pushCategory(notification.type)
});

const deliverPush = async (userId, notification) => {
  if (!pushConfigured) return { delivered: 0, configured: false };
  const subscriptions = await repository.listPushSubscriptions(userId);
  let delivered = 0;
  await Promise.all(subscriptions.map(async (row) => {
    if (row.preferences?.[pushCategory(notification.type)] === false) return;
    try {
      await webpush.sendNotification({
        endpoint: row.endpoint,
        keys: { p256dh: row.p256dh, auth: row.auth }
      }, safePushPayload(notification));
      delivered += 1;
    } catch (error) {
      if ([404, 410].includes(error.statusCode)) {
        await repository.deletePushSubscriptionByEndpoint(row.endpoint);
        return;
      }
      throw error;
    }
  }));
  return { delivered, configured: true };
};

const listNotifications = async (user) => {
  const items = await repository.listByUser(user.id);
  return {
    items,
    count: items.length,
    unreadCount: items.filter((item) => !item.isRead).length
  };
};

const createNotification = async (user, payload, req) => {
  if (!isAdmin(user)) {
    throw new AppError('Only admins can create direct notifications', 403, ERROR_CODES.FORBIDDEN);
  }

  const notification = await repository.create(payload);
  await deliverPush(payload.userId, notification);
  await logAdminAudit(user, req, 'NOTIFICATION_CREATED', {
    resourceType: 'notification',
    resourceId: notification.id,
    targetUserId: payload.userId
  });
  return notification;
};

const subscribePush = async (user, payload, req) => {
  if (!pushConfigured) {
    throw new AppError('Web Push is not configured for this deployment', 503, 'PUSH_NOT_CONFIGURED');
  }
  return repository.upsertPushSubscription(
    user.id,
    payload.subscription,
    payload.preferences || {},
    req.get('user-agent')
  );
};

const unsubscribePush = async (user, endpoint) => {
  await repository.deletePushSubscription(user.id, endpoint);
  return { unsubscribed: true };
};

const markNotificationRead = async (user, notificationId) => {
  const notification = await repository.markRead(user.id, notificationId);
  if (!notification) {
    throw new AppError('Notification not found', 404, ERROR_CODES.NOT_FOUND);
  }
  return notification;
};

const markAllNotificationsRead = async (user) => {
  const items = await repository.markAllRead(user.id);
  return {
    items,
    count: items.length
  };
};

module.exports = {
  listNotifications,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
  subscribePush,
  unsubscribePush,
  deliverPush
};
