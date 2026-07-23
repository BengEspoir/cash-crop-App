const Joi = require('joi');

const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_TOTAL_LENGTH = 12000;

const messageSchema = Joi.object({
  role: Joi.string().valid('user', 'assistant').required(),
  content: Joi.string().trim().min(1).max(MAX_MESSAGE_LENGTH).required()
});

const messagesSchema = Joi.array()
  .items(messageSchema)
  .min(1)
  .max(MAX_MESSAGES)
  .required()
  .custom((messages, helpers) => {
    const totalLength = messages.reduce((sum, message) => sum + message.content.length, 0);

    if (totalLength > MAX_TOTAL_LENGTH) {
      return helpers.error('messages.totalLength');
    }

    if (messages[messages.length - 1].role !== 'user') {
      return helpers.error('messages.lastRole');
    }

    return messages;
  }, 'conversation constraints')
  .messages({
    'messages.totalLength': `Message history must not exceed ${MAX_TOTAL_LENGTH} characters in total`,
    'messages.lastRole': 'Message history must end with a user message'
  });

const chatSchema = Joi.object({
  messages: messagesSchema
}).required();

module.exports = {
  chatSchema,
  MAX_MESSAGES,
  MAX_MESSAGE_LENGTH,
  MAX_TOTAL_LENGTH
};
