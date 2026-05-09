const Joi = require('joi');

const createQuoteSchema = Joi.object({
  listingId: Joi.string().uuid().required(),
  quantity: Joi.number().positive().allow(null).optional(),
  message: Joi.string().min(3).max(2000).required(),
  requestedPrice: Joi.number().min(0).allow(null).optional(),
  currency: Joi.string().max(10).default('XAF')
});

const quoteReasonSchema = Joi.object({
  reason: Joi.string().max(500).allow('', null).optional()
});

module.exports = {
  createQuoteSchema,
  quoteReasonSchema
};
