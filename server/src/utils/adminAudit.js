const { supabaseAdmin } = require('../config/supabase');

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;

const safeResourceId = (value) => (value && UUID_PATTERN.test(String(value)) ? value : null);

const getMissingColumnName = (error) => {
  const message = error?.message || error?.details || '';
  const match = message.match(/Could not find the '([^']+)' column/);
  return match ? match[1] : null;
};

const insertWithMissingColumnFallback = async (table, payload) => {
  let candidate = { ...payload };
  const skippedColumns = new Set();

  while (true) {
    const { error } = await supabaseAdmin.from(table).insert(candidate);
    if (!error) return;

    const missingColumn = getMissingColumnName(error);
    if (!missingColumn || skippedColumns.has(missingColumn)) {
      throw error;
    }

    skippedColumns.add(missingColumn);
    delete candidate[missingColumn];
  }
};

const logAdminAudit = async (user, req, action, details = {}) => {
  try {
    await insertWithMissingColumnFallback('audit_logs', {
      user_id: user?.id || null,
      actor_role: user?.role || null,
      event: action,
      action,
      resource_type: details.resourceType || null,
      resource_id: safeResourceId(details.resourceId),
      status: details.status || 'success',
      ip_address: req?.ip || null,
      user_agent: req?.headers?.['user-agent'] || null,
      metadata: {
        ...details,
        resourceId: details.resourceId || null
      }
    });
  } catch (error) {
    console.error('Admin audit log error:', error);
  }
};

module.exports = {
  logAdminAudit
};
