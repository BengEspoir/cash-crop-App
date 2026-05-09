const Joi = require('joi');

const imageSchema = Joi.object({
  url: Joi.string().uri().required(),
  alt: Joi.string().allow('', null).optional(),
  publicId: Joi.string().allow('', null).optional()
});

const listingPayloadSchema = Joi.object({
  cropName: Joi.string().min(2).max(100).required(),
  quantity: Joi.number().positive().required(),
  quantityUnit: Joi.string().max(20).default('kg'),
  pricePerUnit: Joi.number().min(0).required(),
  currency: Joi.string().max(10).default('XAF'),
  status: Joi.string().valid('draft', 'active').default('active'),
  grade: Joi.string().max(100).allow('', null).optional(),
  deliveryWindow: Joi.string().max(100).allow('', null).optional(),
  summary: Joi.string().max(300).allow('', null).optional(),
  description: Joi.string().allow('', null).optional(),
  locationName: Joi.string().max(200).allow('', null).optional(),
  specs: Joi.object().unknown(true).default({}),
  exportReady: Joi.boolean().default(false),
  images: Joi.array().items(imageSchema).max(6).default([])
});

const listingUpdateSchema = listingPayloadSchema.fork(['cropName', 'quantity', 'pricePerUnit'], (schema) => schema.optional());

module.exports = {
  listingPayloadSchema,
  listingUpdateSchema
};
