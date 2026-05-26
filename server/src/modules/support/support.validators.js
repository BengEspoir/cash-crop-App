const Joi = require('joi');

const createTicketSchema = Joi.object({
  subject: Joi.string().max(200).required(),
  description: Joi.string().max(4000).required(),
  category: Joi.string().max(80).default('general'),
  priority: Joi.string().valid('low', 'normal', 'high', 'urgent').default('normal'),
  relatedEntityType: Joi.string().max(80).allow('', null).optional(),
  relatedEntityId: Joi.string().uuid().allow(null).optional(),
  metadata: Joi.object().default({})
});

const addMessageSchema = Joi.object({
  body: Joi.string().max(4000).required(),
  internalNote: Joi.boolean().default(false)
});

const updateTicketSchema = Joi.object({
  status: Joi.string().valid('open', 'in_progress', 'waiting_on_user', 'resolved', 'closed').optional(),
  priority: Joi.string().valid('low', 'normal', 'high', 'urgent').optional(),
  assignedAdminId: Joi.string().uuid().allow(null).optional()
}).min(1);

module.exports = {
  createTicketSchema,
  addMessageSchema,
  updateTicketSchema
};
