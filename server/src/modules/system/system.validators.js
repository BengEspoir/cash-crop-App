const Joi = require('joi');

const maintenanceSchema = Joi.object({
  message: Joi.string().trim().min(10).max(500).optional()
});

const restoreSchema = Joi.object({
  backupId: Joi.string().uuid().required(),
  confirmation: Joi.string().valid('RESTORE AGRICULNET').required()
});

module.exports = {
  maintenanceSchema,
  restoreSchema
};
