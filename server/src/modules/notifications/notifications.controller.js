const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/response');
const service = require('./notifications.service');

const listNotifications = asyncHandler(async (req, res) => {
  const result = await service.listNotifications(req.user);
  sendSuccess(res, result, 'Notifications retrieved successfully');
});

const createNotification = asyncHandler(async (req, res) => {
  const result = await service.createNotification(req.user, req.body, req);
  sendSuccess(res, result, 'Notification created successfully', 201);
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const result = await service.markNotificationRead(req.user, req.params.id);
  sendSuccess(res, result, 'Notification marked as read');
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const result = await service.markAllNotificationsRead(req.user);
  sendSuccess(res, result, 'Notifications marked as read');
});

const subscribePush = asyncHandler(async (req, res) => {
  const result = await service.subscribePush(req.user, req.body, req);
  sendSuccess(res, result, 'Push subscription saved', 201);
});

const unsubscribePush = asyncHandler(async (req, res) => {
  const result = await service.unsubscribePush(req.user, req.body.endpoint);
  sendSuccess(res, result, 'Push subscription removed');
});

module.exports = {
  listNotifications,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
  subscribePush,
  unsubscribePush
};
