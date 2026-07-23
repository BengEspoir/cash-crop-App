const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/response');
const chatService = require('./chat.service');

const createChatResponse = asyncHandler(async (req, res) => {
  const reply = await chatService.generateReply(req.body.messages);
  sendSuccess(res, { reply }, 'AI response generated');
});

module.exports = { createChatResponse };
