const Joi = require('joi');

const createOrderSchema = Joi.object({
  listingId: Joi.string().uuid().optional(),
  quoteId: Joi.string().uuid().optional(),
  quantity: Joi.number().positive().required(),
  quantityUnit: Joi.string().max(20).default('kg'),
  unitPrice: Joi.number().min(0).optional(),
  shippingAddress: Joi.string().max(1000).allow('', null).optional(),
  billingAddress: Joi.string().max(1000).allow('', null).optional(),
  notes: Joi.string().max(2000).allow('', null).optional()
}).xor('listingId', 'quoteId');

const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid(
    'pending_payment',
    'confirmed',
    'inspection_in_progress',
    'verified',
    'processing',
    'in_transit',
    'delivered',
    'completed',
    'cancelled',
    'disputed'
  ).required()
});

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema
};
