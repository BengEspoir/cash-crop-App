require('dotenv').config();
const app = require('./src/app');
const logger = require('./src/utils/logger');
const { scheduler } = require('./src/jobs/scheduler');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`AgriculNet API running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`Health: http://localhost:${PORT}/api/health`);
  
  // Start background job scheduler
  if (process.env.NODE_ENV !== 'test') {
    scheduler.start();
    logger.info('Job scheduler started');
  }
});

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION:', err);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

module.exports = server;
