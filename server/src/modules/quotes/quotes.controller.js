const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/response');
const service = require('./quotes.service');

const createQuote = asyncHandler(async (req, res) => {
  const result = await service.createQuote(req.user, req.body, req);
  sendSuccess(res, result, 'Quote request submitted successfully', 201);
});

const listQuotes = asyncHandler(async (req, res) => {
  const result = await service.listQuotes(req.user);
  sendSuccess(res, result, 'Quotes retrieved successfully');
});

const getQuote = asyncHandler(async (req, res) => {
  const result = await service.getQuote(req.user, req.params.id);
  sendSuccess(res, result, 'Quote retrieved successfully');
});

const acceptQuote = asyncHandler(async (req, res) => {
  const result = await service.updateQuoteStatus(req.user, req.params.id, 'accepted');
  sendSuccess(res, result, 'Quote accepted successfully');
});

const rejectQuote = asyncHandler(async (req, res) => {
  const result = await service.updateQuoteStatus(req.user, req.params.id, 'rejected');
  sendSuccess(res, result, 'Quote rejected successfully');
});

const cancelQuote = asyncHandler(async (req, res) => {
  const result = await service.updateQuoteStatus(req.user, req.params.id, 'cancelled');
  sendSuccess(res, result, 'Quote cancelled successfully');
});

const completeQuote = asyncHandler(async (req, res) => {
  const result = await service.updateQuoteStatus(req.user, req.params.id, 'completed');
  sendSuccess(res, result, 'Quote completed successfully');
});

module.exports = {
  createQuote,
  listQuotes,
  getQuote,
  acceptQuote,
  rejectQuote,
  cancelQuote,
  completeQuote
};
