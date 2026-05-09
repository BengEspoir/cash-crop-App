const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/response');
const service = require('./orders.service');

const listOrders = asyncHandler(async (req, res) => {
  const result = await service.listOrders(req.user);
  sendSuccess(res, result, 'Orders retrieved successfully');
});

const createOrder = asyncHandler(async (req, res) => {
  const result = await service.createOrder(req.user, req.body);
  sendSuccess(res, result, 'Order created successfully', 201);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const result = await service.updateOrderStatus(req.user, req.params.id, req.body.status);
  sendSuccess(res, result, 'Order status updated successfully');
});

module.exports = {
  listOrders,
  createOrder,
  updateOrderStatus
};
