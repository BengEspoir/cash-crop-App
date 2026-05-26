const Joi = require('joi');

const updateDashboardPreferencesSchema = Joi.object({
  preferences: Joi.object().default({}),
  notificationPreferences: Joi.object().default({})
}).or('preferences', 'notificationPreferences');

module.exports = {
  updateDashboardPreferencesSchema
};
