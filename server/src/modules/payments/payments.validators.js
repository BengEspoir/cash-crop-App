const Joi = require('joi');

const createPaymentSchema = Joi.object({
  orderId: Joi.string().required(),
  channel: Joi.string().valid('mtn_momo', 'orange_money', 'bank_transfer', 'credit_card', 'cash_on_delivery').allow(null).optional()
});

const createCheckoutIntentSchema = Joi.object({
  orderId: Joi.string().required(),
  channel: Joi.string().valid('mtn_momo', 'orange_money', 'bank_transfer', 'credit_card', 'cash_on_delivery').allow(null).optional(),
  provider: Joi.string().valid('fapshi', 'internal_ledger').allow(null, '').optional()
});

const releasePaymentSchema = Joi.object({
  confirmation: Joi.string().required(),
  reason: Joi.string().trim().min(10).max(500).required()
}).custom((value, helpers) => value.confirmation === 'RELEASE PROTECTED PAYOUT'
  ? value
  : helpers.error('any.custom')).messages({
  'any.custom': 'Type RELEASE PROTECTED PAYOUT to confirm this audited action'
});

module.exports = {
  createPaymentSchema,
  createCheckoutIntentSchema,
  releasePaymentSchema
};
