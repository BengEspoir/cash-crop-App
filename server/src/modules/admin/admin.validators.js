const Joi = require('joi');

const accountModerationSchema = Joi.object({
  reason: Joi.string().trim().min(10).max(500).required(),
  confirmation: Joi.string().valid('CONFIRM ACCOUNT ACTION').required()
});

module.exports = {
  accountModerationSchema
};
