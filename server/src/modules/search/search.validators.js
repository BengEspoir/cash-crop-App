const Joi = require('joi');

const aiSearchSchema = Joi.object({
  query: Joi.string().trim().min(2).max(1000).required()
}).required();

module.exports = { aiSearchSchema };
