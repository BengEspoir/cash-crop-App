const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/response');
const service = require('./payments.service');

const listPayments = asyncHandler(async (req, res) => {
  const result = await service.listPayments(req.user);
  sendSuccess(res, result, 'Payments retrieved successfully');
});

const createPayment = asyncHandler(async (req, res) => {
  const result = await service.createPayment(req.user, req.body);
  sendSuccess(res, result, 'Internal payment record created successfully', 201);
});

const releasePayment = asyncHandler(async (req, res) => {
  const result = await service.releasePayment(req.user, req.params.id);
  sendSuccess(res, result, 'Payment released successfully');
});

const createCheckoutIntent = asyncHandler(async (req, res) => {
  const result = await service.createCheckoutIntent(req.user, req.body);
  sendSuccess(res, result, 'Checkout intent prepared successfully', 201);
});

const getCheckoutIntent = asyncHandler(async (req, res) => {
  const result = await service.getCheckoutIntent(req.user, req.params.id);
  sendSuccess(res, result, 'Checkout intent retrieved successfully');
});

const confirmCheckoutIntent = asyncHandler(async (req, res) => {
  const result = await service.confirmCheckoutIntent(req.user, req.params.id);
  sendSuccess(res, result, 'Checkout intent confirmed successfully');
});

const handleFapshiWebhook = asyncHandler(async (req, res) => {
  const result = await service.handleFapshiWebhook(req.body);
  sendSuccess(res, result, 'Fapshi webhook processed successfully');
});

const requestWithdrawal = asyncHandler(async (req, res) => {
  const result = await service.requestWithdrawal(req.user);
  sendSuccess(res, result, 'Withdrawal request checked successfully');
});

module.exports = {
  listPayments,
  createPayment,
  createCheckoutIntent,
  getCheckoutIntent,
  confirmCheckoutIntent,
  handleFapshiWebhook,
  releasePayment,
  requestWithdrawal
};
