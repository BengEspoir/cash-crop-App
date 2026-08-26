const logger = require('../utils/logger');
const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, _next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  if (err.isOperational) {
    return sendError(res, err.message, err.statusCode, err.errorCode, err.details);
  }

  return sendError(res, 'An unexpected error occurred', 500, 'SERVER_ERROR');
};

module.exports = errorHandler;
