const { sendError } = require('../utils/response');

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const details = error.details.map(d => ({
      field: d.path.join('.'),
      message: d.message.replace(/['"]/g, '')
    }));
    return sendError(res, 'Validation failed', 400, 'VALIDATION_ERROR', details);
  }
  req.body = value;
  next();
};

module.exports = validate;
