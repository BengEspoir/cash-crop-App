const { supabaseAdmin } = require('../../config/supabase');

const getShipmentById = async (id) => {
  const { data, error } = await supabaseAdmin.from('logistics').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
};

const getShipmentByOrderId = async (orderId) => {
  const { data, error } = await supabaseAdmin.from('logistics').select('*').eq('order_id', orderId).maybeSingle();
  if (error) throw error;
  return data;
};

const listShipments = async (queryBuilder) => {
  const { data, error } = await queryBuilder;
  if (error) throw error;
  return data || [];
};

const createShipment = async (payload) => {
  const { data, error } = await supabaseAdmin.from('logistics').insert(payload).select().single();
  if (error) throw error;
  return data;
};

const updateShipment = async (shipmentId, updates) => {
  const { data, error } = await supabaseAdmin
    .from('logistics')
    .update(updates)
    .eq('id', shipmentId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const listPositions = async (logisticsId) => {
  const { data, error } = await supabaseAdmin
    .from('logistics_position_updates')
    .select('*')
    .eq('logistics_id', logisticsId)
    .order('captured_at', { ascending: true });
  if (error) throw error;
  return data || [];
};

const createPosition = async (payload) => {
  const { data, error } = await supabaseAdmin
    .from('logistics_position_updates')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const listTrucks = async () => {
  const { data, error } = await supabaseAdmin
    .from('trucks')
    .select('*')
    .eq('is_active', true)
    .order('display_name', { ascending: true });
  if (error) throw error;
  return data || [];
};

const getTruckById = async (truckId) => {
  const { data, error } = await supabaseAdmin.from('trucks').select('*').eq('id', truckId).single();
  if (error) throw error;
  return data;
};

const findLogisticsRate = async ({ originRegion, originCity, destinationRegion, destinationCity }) => {
  const { data, error } = await supabaseAdmin
    .from('logistics_rate_zones')
    .select('*')
    .eq('is_active', true)
    .eq('origin_region', originRegion)
    .eq('destination_region', destinationRegion)
    .order('origin_city', { ascending: false, nullsFirst: false })
    .order('destination_city', { ascending: false, nullsFirst: false });
  if (error) throw error;

  const rows = data || [];
  return (
    rows.find((row) => row.origin_city === originCity && row.destination_city === destinationCity) ||
    rows.find((row) => row.origin_city === originCity && row.destination_city === null) ||
    rows.find((row) => row.origin_city === null && row.destination_city === destinationCity) ||
    rows.find((row) => row.origin_city === null && row.destination_city === null) ||
    null
  );
};

const createNotification = async (payload) => {
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
  return data;
};

const getBuyerProfileById = async (id) => {
  const { data, error } = await supabaseAdmin.from('buyer_profiles').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
};

const getSellerProfile = async (table, id) => {
  const { data, error } = await supabaseAdmin.from(table).select('*').eq('id', id).single();
  if (error) throw error;
  return data;
};

const getUsersByIds = async (ids) => {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (!uniqueIds.length) return {};

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, first_name, last_name, email, phone, role, status, city, region, country')
    .in('id', uniqueIds);
  if (error) throw error;

  return (data || []).reduce((acc, row) => {
    acc[row.id] = row;
    return acc;
  }, {});
};

module.exports = {
  getShipmentById,
  getShipmentByOrderId,
  listShipments,
  createShipment,
  updateShipment,
  listPositions,
  createPosition,
  listTrucks,
  getTruckById,
  findLogisticsRate,
  createNotification,
  getBuyerProfileById,
  getSellerProfile,
  getUsersByIds
};
