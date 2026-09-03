const repository = require('./system.repository');
const { clearMaintenanceCache } = require('../../middleware/maintenance');
const { logAdminAudit } = require('../../utils/adminAudit');

const DEFAULT_MESSAGE = 'AgriculNet is currently under maintenance. Some functionalities may be temporarily unavailable. Please try again shortly.';

const mapMaintenance = (row = {}) => ({
  enabled: Boolean(row.maintenance_enabled),
  message: row.maintenance_message || DEFAULT_MESSAGE,
  startedAt: row.maintenance_started_at || null,
  updatedAt: row.updated_at || null
});

const getStatus = async () => mapMaintenance(await repository.getMaintenanceState());

const setMaintenance = async (user, req, enabled, message) => {
  const previous = await repository.getMaintenanceState();
  const now = new Date().toISOString();
  const next = await repository.updateMaintenanceState({
    maintenance_enabled: enabled,
    maintenance_message: String(message || previous.maintenance_message || DEFAULT_MESSAGE).trim(),
    maintenance_started_at: enabled ? (previous.maintenance_started_at || now) : null,
    maintenance_started_by: enabled ? (previous.maintenance_started_by || user.id) : null,
    updated_by: user.id
  });
  clearMaintenanceCache();
  await logAdminAudit(user, req, enabled ? 'MAINTENANCE_ENABLED' : 'MAINTENANCE_DISABLED', {
    resourceType: 'system_settings',
    previousMaintenanceState: Boolean(previous.maintenance_enabled),
    newMaintenanceState: enabled,
    messageChanged: previous.maintenance_message !== next.maintenance_message
  });
  return mapMaintenance(next);
};

module.exports = {
  DEFAULT_MESSAGE,
  getStatus,
  setMaintenance,
  mapMaintenance
};
