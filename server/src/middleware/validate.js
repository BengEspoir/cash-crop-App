const { sendError } = require('../utils/response');

const validate = (schema, source = 'body') => (req, res, next) => {
  const target = req[source] || {};
  const { error, value } = schema.validate(target, { abortEarly: false, stripUnknown: true });
  if (error) {
    const details = error.details.map(d => ({
      field: d.path.join('.'),
      message: d.message.replace(/['"]/g, '')
    }));
    return sendError(res, 'Validation failed', 400, 'VALIDATION_ERROR', details);
  }
  req[source] = value;
  next();
};

module.exports = validate;
