const Joi = require('joi');

const createNotificationSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  type: Joi.string().valid('system', 'order_update', 'payment_received', 'new_message', 'listing_approved', 'dispute_update').default('system'),
  title: Joi.string().max(200).required(),
  content: Joi.string().max(2000).required(),
  link: Joi.string().max(300).allow('', null).optional(),
  priority: Joi.string().valid('low', 'normal', 'high', 'urgent').default('normal'),
  entityType: Joi.string().max(80).allow('', null).optional(),
  entityId: Joi.string().uuid().allow(null).optional(),
  metadata: Joi.object().default({})
});

module.exports = {
  createNotificationSchema
};
