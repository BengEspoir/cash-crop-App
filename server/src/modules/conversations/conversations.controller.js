const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/response');
const service = require('./conversations.service');

const createConversation = asyncHandler(async (req, res) => {
  const result = await service.createConversation(req.user, req.body);
  sendSuccess(res, result, 'Conversation ready', 201);
});

const listConversations = asyncHandler(async (req, res) => {
  const result = await service.listConversations(req.user);
  sendSuccess(res, result, 'Conversations retrieved successfully');
});

const getConversation = asyncHandler(async (req, res) => {
  const result = await service.getConversation(req.user, req.params.id);
  sendSuccess(res, result, 'Conversation retrieved successfully');
});

const sendMessage = asyncHandler(async (req, res) => {
  const result = await service.sendMessage(req.user, req.params.id, req.body.content);
  sendSuccess(res, result, 'Message sent successfully', 201);
});

module.exports = {
  createConversation,
  listConversations,
  getConversation,
  sendMessage
};
