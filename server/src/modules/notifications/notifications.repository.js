const { supabaseAdmin } = require('../../config/supabase');

const isNotFound = (error) => error?.code === 'PGRST116';

const mapNotification = (row) => ({
  id: row.id,
  type: row.type,
  title: row.title,
  content: row.content,
  detail: row.content,
  link: row.link,
  isRead: Boolean(row.is_read),
  status: row.is_read ? 'verified' : 'pending',
  readAt: row.read_at,
  priority: row.priority || 'normal',
  entityType: row.entity_type,
  entityId: row.entity_id,
  metadata: row.metadata || {},
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const listByUser = async (userId, limit = 50) => {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).map(mapNotification);
};

const create = async (payload) => {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: payload.userId,
      type: payload.type || 'system',
      title: payload.title,
      content: payload.content,
      link: payload.link || null,
      priority: payload.priority || 'normal',
      entity_type: payload.entityType || null,
      entity_id: payload.entityId || null,
      metadata: payload.metadata || {}
    })
    .select()
    .single();
  if (error) throw error;
  return mapNotification(data);
};

const markRead = async (userId, notificationId) => {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
      read_by: userId
    })
    .eq('id', notificationId)
    .eq('user_id', userId)
    .select()
    .single();
  if (error && isNotFound(error)) return null;
  if (error) throw error;
  return mapNotification(data);
};

const markAllRead = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
      read_by: userId
    })
    .eq('user_id', userId)
    .eq('is_read', false)
    .select();
  if (error) throw error;
  return (data || []).map(mapNotification);
};

module.exports = {
  listByUser,
  create,
  markRead,
  markAllRead,
  mapNotification
};
