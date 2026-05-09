const Joi = require('joi');

const createPaymentSchema = Joi.object({
  orderId: Joi.string().required(),
  channel: Joi.string().valid('mtn_momo', 'orange_money', 'bank_transfer', 'credit_card', 'cash_on_delivery').allow(null).optional()
});

module.exports = {
  createPaymentSchema
};
