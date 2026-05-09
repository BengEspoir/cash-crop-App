const Joi = require('joi');

const createConversationSchema = Joi.object({
  farmerId: Joi.string().uuid().optional(),
  resellerId: Joi.string().uuid().optional(),
  buyerId: Joi.string().uuid().optional(),
  listingId: Joi.string().uuid().allow(null).optional(),
  quoteId: Joi.string().uuid().optional(),
  initialMessage: Joi.string().max(2000).allow('', null).optional()
}).or('farmerId', 'resellerId', 'buyerId', 'quoteId');

const sendMessageSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required()
});

module.exports = {
  createConversationSchema,
  sendMessageSchema
};
