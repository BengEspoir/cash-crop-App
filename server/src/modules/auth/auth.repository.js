const { supabaseAdmin } = require('../../config/supabase');
const helpers = require('./auth.helpers');

const getMissingColumnName = (error) => {
  const message = error?.message || error?.details || '';
  const match = message.match(/Could not find the '([^']+)' column/);
  return match ? match[1] : null;
};

const insertWithMissingColumnFallback = async (table, payload) => {
  let candidate = { ...payload };
  const skippedColumns = new Set();

  while (true) {
    const { data, error } = await supabaseAdmin
      .from(table)
      .insert(candidate)
      .select()
      .single();

    if (!error) {
      return data;
    }

    const missingColumn = getMissingColumnName(error);
    if (!missingColumn || skippedColumns.has(missingColumn)) {
      throw error;
    }

    skippedColumns.add(missingColumn);
    delete candidate[missingColumn];
  }
};

const updateWithMissingColumnFallback = async (table, userId, payload) => {
  let candidate = { ...payload };
  const skippedColumns = new Set();

  while (true) {
    const { data, error } = await supabaseAdmin
      .from(table)
      .update(candidate)
      .eq('user_id', userId)
      .select()
      .single();

    if (!error) {
      return data;
    }

    const missingColumn = getMissingColumnName(error);
    if (!missingColumn || skippedColumns.has(missingColumn)) {
      throw error;
    }

    skippedColumns.add(missingColumn);
    delete candidate[missingColumn];
  }
};

const findUserByPhone = async (phone) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('phone', phone)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

const findUserByEmail = async (email) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

const findUserById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

const findUserByIdentifier = async (identifier) => {
  if (!identifier) {
    return null;
  }

  if (identifier.includes('@')) {
    return findUserByEmail(identifier);
  }

  return findUserByPhone(helpers.normalizePhone(identifier));
};

const createUser = async (userData) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert(userData)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const createFarmerProfile = async (userId, profileData) => {
  return insertWithMissingColumnFallback('farmer_profiles', { user_id: userId, ...profileData });
};

const createBuyerProfile = async (userId, profileData) => {
  return insertWithMissingColumnFallback('buyer_profiles', { user_id: userId, ...profileData });
};

const createResellerProfile = async (userId, profileData) => {
  return insertWithMissingColumnFallback('reseller_profiles', { user_id: userId, ...profileData });
};

const updateUser = async (id, updateData) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const incrementFailedAttempts = async (id) => {
  const user = await findUserById(id);
  const { data, error } = await supabaseAdmin
    .from('users')
    .update({ failed_login_attempts: (user?.failed_login_attempts || 0) + 1 })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const resetFailedAttempts = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update({ failed_login_attempts: 0, locked_until: null })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const lockUserAccount = async (id, lockUntil) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update({ locked_until: lockUntil })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const updateLastLogin = async (id) => {
  const user = await findUserById(id);
  const { data, error } = await supabaseAdmin
    .from('users')
    .update({
      last_login_at: new Date().toISOString(),
      login_count: (user?.login_count || 0) + 1
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const saveToken = async (tokenData) => {
  const { data, error } = await supabaseAdmin
    .from('tokens')
    .insert(tokenData)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const findToken = async (tokenHash, type) => {
  const { data, error } = await supabaseAdmin
    .from('tokens')
    .select('*')
    .eq('token_hash', tokenHash)
    .eq('type', type)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

const markTokenUsed = async (tokenId) => {
  const { data, error } = await supabaseAdmin
    .from('tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', tokenId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const deleteUserTokens = async (userId, type) => {
  const { error } = await supabaseAdmin
    .from('tokens')
    .delete()
    .eq('user_id', userId)
    .eq('type', type);
  if (error) throw error;
};

const saveOtp = async (otpData) => {
  const { data, error } = await supabaseAdmin
    .from('otps')
    .insert(otpData)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const findLatestOtp = async (userId, purpose) => {
  const { data, error } = await supabaseAdmin
    .from('otps')
    .select('*')
    .eq('user_id', userId)
    .eq('purpose', purpose)
    .is('verified_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

const incrementOtpAttempts = async (otpId) => {
  const { data: otp, error: fetchError } = await supabaseAdmin
    .from('otps')
    .select('id, attempts')
    .eq('id', otpId)
    .single();

  if (fetchError) throw fetchError;

  const { data, error } = await supabaseAdmin
    .from('otps')
    .update({ attempts: (otp?.attempts || 0) + 1 })
    .eq('id', otpId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const markOtpVerified = async (otpId) => {
  const { data, error } = await supabaseAdmin
    .from('otps')
    .update({ verified_at: new Date().toISOString() })
    .eq('id', otpId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const deleteUserOtps = async (userId, purpose) => {
  const { error } = await supabaseAdmin
    .from('otps')
    .delete()
    .eq('user_id', userId)
    .eq('purpose', purpose);
  if (error) throw error;
};

const logAuditEvent = async (userId, event, req, metadata = {}) => {
  const { error } = await supabaseAdmin
    .from('audit_logs')
    .insert({
      user_id: userId,
      event,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      metadata
    });
  if (error) console.error('Audit log error:', error);
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const logActivityEvent = async (userId, eventType, req, metadata = {}) => {
  const entityId = metadata.entityId && UUID_PATTERN.test(String(metadata.entityId))
    ? metadata.entityId
    : null;

  const { error } = await supabaseAdmin
    .from('activity_events')
    .insert({
      user_id: userId,
      role: metadata.role || null,
      event_type: eventType,
      path: req.originalUrl,
      entity_type: metadata.entityType || null,
      entity_id: entityId,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      metadata
    });

  if (error && !['PGRST205', '42P01'].includes(error.code)) {
    console.error('Activity log error:', error);
  }
};

const getFarmerProfile = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('farmer_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

const getBuyerProfile = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('buyer_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

const getResellerProfile = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('reseller_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

const updateFarmerProfile = async (userId, updateData) => {
  return updateWithMissingColumnFallback('farmer_profiles', userId, updateData);
};

const updateResellerProfile = async (userId, updateData) => {
  return updateWithMissingColumnFallback('reseller_profiles', userId, updateData);
};

const findUsersByStatus = async (status) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*, farmer_profiles(*), buyer_profiles(*), reseller_profiles(*)')
    .eq('status', status)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

module.exports = {
  findUserByPhone,
  findUserByEmail,
  findUserById,
  findUserByIdentifier,
  findUsersByStatus,
  createUser,
  createFarmerProfile,
  createBuyerProfile,
  createResellerProfile,
  updateUser,
  updateFarmerProfile,
  updateResellerProfile,
  incrementFailedAttempts,
  resetFailedAttempts,
  lockUserAccount,
  updateLastLogin,
  saveToken,
  findToken,
  markTokenUsed,
  deleteUserTokens,
  saveOtp,
  findLatestOtp,
  incrementOtpAttempts,
  markOtpVerified,
  deleteUserOtps,
  logAuditEvent,
  logActivityEvent,
  getFarmerProfile,
  getBuyerProfile,
  getResellerProfile
};
