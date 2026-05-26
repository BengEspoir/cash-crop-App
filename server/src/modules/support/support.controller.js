const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/response');
const service = require('./support.service');

const listTickets = asyncHandler(async (req, res) => {
  const result = await service.listTickets(req.user);
  sendSuccess(res, result, 'Support tickets retrieved successfully');
});

const createTicket = asyncHandler(async (req, res) => {
  const result = await service.createTicket(req.user, req.body, req);
  sendSuccess(res, result, 'Support ticket created successfully', 201);
});

const getTicket = asyncHandler(async (req, res) => {
  const result = await service.getTicket(req.user, req.params.id);
  sendSuccess(res, result, 'Support ticket retrieved successfully');
});

const addMessage = asyncHandler(async (req, res) => {
  const result = await service.addMessage(req.user, req.params.id, req.body, req);
  sendSuccess(res, result, 'Support ticket message added successfully', 201);
});

const updateTicket = asyncHandler(async (req, res) => {
  const result = await service.updateTicket(req.user, req.params.id, req.body, req);
  sendSuccess(res, result, 'Support ticket updated successfully');
});

module.exports = {
  listTickets,
  createTicket,
  getTicket,
  addMessage,
  updateTicket
};
