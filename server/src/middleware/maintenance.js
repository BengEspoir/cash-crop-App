const repository = require('../modules/system/system.repository');
const { sendError } = require('../utils/response');
const logger = require('../utils/logger');

const CACHE_TTL_MS = 5000;
const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const ALWAYS_AVAILABLE_PREFIXES = [
  '/api/health',
  '/api/v1/system/status',
  '/api/v1/admin/maintenance',
  '/api/v1/admin/backups',
  '/api/v1/admin/restores',
  '/api/v1/auth',
  '/api/webhooks/',
  '/api/webhook/'
];

let cachedState = null;
let cachedAt = 0;

const clearMaintenanceCache = () => {
  cachedState = null;
  cachedAt = 0;
};

const loadState = async () => {
  if (cachedState && Date.now() - cachedAt < CACHE_TTL_MS) return cachedState;
  cachedState = await repository.getMaintenanceState();
  cachedAt = Date.now();
  return cachedState;
};

const maintenanceGuard = async (req, res, next) => {
  if (!WRITE_METHODS.has(req.method)) return next();
  if (ALWAYS_AVAILABLE_PREFIXES.some((prefix) => req.path.startsWith(prefix))) return next();

  try {
    const state = await loadState();
    if (!state.maintenance_enabled) return next();
    return sendError(
      res,
      state.maintenance_message,
      503,
      'SYSTEM_MAINTENANCE',
      {
        enabled: true,
        startedAt: state.maintenance_started_at,
        retryable: true
      }
    );
  } catch (error) {
    logger.error({
      event: 'MAINTENANCE_STATE_READ_FAILED',
      message: error.message,
      code: error.code || null
    });
    return next();
  }
};

module.exports = {
  maintenanceGuard,
  clearMaintenanceCache,
  loadState
};
