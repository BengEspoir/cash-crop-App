const AppError = require('../../utils/AppError');
const { ERROR_CODES, USER_ROLES } = require('../../config/constants');
const repository = require('./notifications.repository');
const { logAdminAudit } = require('../../utils/adminAudit');

const isAdmin = (user) => [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(user.role);

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
  await logAdminAudit(user, req, 'NOTIFICATION_CREATED', {
    resourceType: 'notification',
    resourceId: notification.id,
    targetUserId: payload.userId
  });
  return notification;
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
  markAllNotificationsRead
};
