const Joi = require('joi');

const listFarmersQuerySchema = Joi.object({
  sellerType: Joi.string().valid('farmer', 'reseller', '').allow(null).optional(),
  query: Joi.string().trim().max(100).allow('', null).optional(),
  crop: Joi.string().trim().max(100).allow('', null).optional(),
  region: Joi.string().trim().max(100).allow('', null).optional(),
  verificationStatus: Joi.string().valid('verified', 'pending', 'rejected', '').allow(null).optional(),
  sort: Joi.string().valid('rating', 'recent', 'name', '').allow(null).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(8)
});

module.exports = {
  listFarmersQuerySchema
};
