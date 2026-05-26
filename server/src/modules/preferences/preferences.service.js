const { supabaseAdmin } = require('../../config/supabase');
const { logAdminAudit } = require('../../utils/adminAudit');

const mapPreferences = (row, user) => ({
  id: row?.id || null,
  userId: row?.user_id || user.id,
  role: row?.role || user.role,
  preferences: row?.preferences || {},
  notificationPreferences: row?.notification_preferences || {},
  createdAt: row?.created_at || null,
  updatedAt: row?.updated_at || null
});

const getDashboardPreferences = async (user) => {
  const { data, error } = await supabaseAdmin
    .from('dashboard_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code === 'PGRST116') {
    return mapPreferences(null, user);
  }
  if (error) throw error;
  return mapPreferences(data, user);
};

const updateDashboardPreferences = async (user, payload, req) => {
  const current = await getDashboardPreferences(user);
  const nextPreferences = {
    ...(current.preferences || {}),
    ...(payload.preferences || {})
  };
  const nextNotificationPreferences = {
    ...(current.notificationPreferences || {}),
    ...(payload.notificationPreferences || {})
  };

  const { data, error } = await supabaseAdmin
    .from('dashboard_preferences')
    .upsert({
      user_id: user.id,
      role: user.role,
      preferences: nextPreferences,
      notification_preferences: nextNotificationPreferences
    }, { onConflict: 'user_id' })
    .select()
    .single();
  if (error) throw error;

  await logAdminAudit(user, req, 'DASHBOARD_PREFERENCES_UPDATED', {
    resourceType: 'dashboard_preferences',
    resourceId: data.id,
    changedKeys: Object.keys(payload.preferences || {}),
    notificationChangedKeys: Object.keys(payload.notificationPreferences || {})
  });

  return mapPreferences(data, user);
};

module.exports = {
  getDashboardPreferences,
  updateDashboardPreferences
};
