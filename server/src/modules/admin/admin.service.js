const { supabaseAdmin } = require('../../config/supabase');
const env = require('../../config/env');
const AppError = require('../../utils/AppError');
const { ERROR_CODES } = require('../../config/constants');
const { mapFarmerProfile, mapResellerProfile, normalizeVerificationStatus } = require('../../utils/marketplace');
const authService = require('../auth/auth.service');
const { logAdminAudit } = require('../../utils/adminAudit');

const isNotFound = (error) => error?.code === 'PGRST116';

const signStoragePath = async (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) {
    return { url: path, legacyPublicUrl: true };
  }

  const { data, error } = await supabaseAdmin.storage
    .from(env.SUPABASE_VERIFICATION_BUCKET)
    .createSignedUrl(path, 10 * 60);

  if (error) {
    return { url: null, error: error.message };
  }

  return { url: data.signedUrl, legacyPublicUrl: false };
};

const getUserById = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, first_name, last_name, email, phone, role, status, region, city, country, created_at')
    .eq('id', userId)
    .single();
  if (error && isNotFound(error)) throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND);
  if (error) throw error;
  return data;
};

const getUsersByIds = async (ids) => {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (!uniqueIds.length) return {};

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, first_name, last_name, email, phone, role')
    .in('id', uniqueIds);
  if (error) throw error;

  return (data || []).reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {});
};

const mapUserName = (user) => {
  if (!user) return 'System';
  return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || user.phone || 'System';
};

const mapSubmission = async (profile, includeSignedAssets = false) => {
  const user = await getUserById(profile.user_id);
  const isReseller = user.role === 'reseller';
  const farmer = isReseller
    ? mapResellerProfile(profile, user, { sellerType: 'reseller' })
    : mapFarmerProfile(profile, user, { sellerType: 'farmer' });
  const assets = includeSignedAssets ? {
    idFront: await signStoragePath(profile.id_front_storage_path || profile.id_front_url),
    idBack: await signStoragePath(profile.id_back_storage_path || profile.id_back_url),
    selfie: await signStoragePath(profile.selfie_storage_path || profile.selfie_url)
  } : undefined;

  return {
    userId: user.id,
    farmer,
    status: normalizeVerificationStatus(profile),
    submittedAt: profile.verification_submitted_at,
    rejectionReason: profile.rejection_reason || null,
    assets
  };
};

const listVerificationSubmissions = async (status) => {
  let query = supabaseAdmin
    .from('farmer_profiles')
    .select('*')
    .not('verification_submitted_at', 'is', null)
    .order('verification_submitted_at', { ascending: false });

  if (status) {
    query = query.eq('identity_verification_status', status);
  }

  const { data, error } = await query;
  if (error) throw error;

  let resellerQuery = supabaseAdmin
    .from('reseller_profiles')
    .select('*')
    .not('verification_submitted_at', 'is', null)
    .order('verification_submitted_at', { ascending: false });
  if (status) resellerQuery = resellerQuery.eq('identity_verification_status', status);
  const { data: resellerData, error: resellerError } = await resellerQuery;
  if (resellerError) throw resellerError;

  const items = [];
  for (const profile of data || []) {
    items.push(await mapSubmission(profile, false));
  }
  for (const profile of resellerData || []) {
    items.push(await mapSubmission(profile, false));
  }
  return { items, count: items.length };
};

const getVerificationSubmission = async (userId) => {
  let { data, error } = await supabaseAdmin
    .from('farmer_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && isNotFound(error)) {
    const resellerResult = await supabaseAdmin
      .from('reseller_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    data = resellerResult.data;
    error = resellerResult.error;
  }

  if (error && isNotFound(error)) throw new AppError('Verification submission not found', 404, ERROR_CODES.NOT_FOUND);
  if (error) throw error;

  return mapSubmission(data, true);
};

const reviewVerificationSubmission = async (adminId, userId, action, reason, req) => {
  await getVerificationSubmission(userId);
  return authService.adminReviewUser(adminId, userId, action, reason, req);
};

const listAuditLogs = async (limit = 100) => {
  const safeLimit = Math.min(250, Math.max(1, Number(limit) || 100));
  const { data, error } = await supabaseAdmin
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(safeLimit);
  if (error) throw error;

  const users = await getUsersByIds((data || []).map((row) => row.user_id));
  const items = (data || []).map((row) => {
    const actor = users[row.user_id];
    return {
      id: row.id,
      action: row.action || row.event,
      title: row.action || row.event,
      event: row.event,
      actor: actor ? {
        id: actor.id,
        name: mapUserName(actor),
        role: row.actor_role || actor.role,
        email: actor.email
      } : null,
      actorRole: row.actor_role || actor?.role || null,
      resourceType: row.resource_type,
      resourceId: row.resource_id,
      status: row.status || 'success',
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      metadata: row.metadata || {},
      detail: row.metadata ? JSON.stringify(row.metadata) : row.event,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  });

  return {
    items,
    count: items.length
  };
};

const changeAccountAvailability = async (admin, userId, nextStatus, reason, req) => {
  const target = await getUserById(userId);
  if (target.id === admin.id) {
    throw new AppError('You cannot suspend or restore your own administrator account', 409, ERROR_CODES.VALIDATION_ERROR);
  }
  if (target.role === 'super_admin' && admin.role !== 'super_admin') {
    throw new AppError('Only a super administrator can change another super administrator', 403, ERROR_CODES.FORBIDDEN);
  }
  if (target.role === 'super_admin' && nextStatus === 'suspended') {
    const { count, error: countError } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'super_admin')
      .eq('status', 'active');
    if (countError) throw countError;
    if ((count || 0) <= 1) {
      throw new AppError('The last active super administrator cannot be suspended', 409, ERROR_CODES.VALIDATION_ERROR);
    }
  }

  const update = nextStatus === 'suspended'
    ? { status: nextStatus, banned_at: new Date().toISOString(), ban_reason: reason }
    : { status: nextStatus, banned_at: null, ban_reason: null };
  const { data, error } = await supabaseAdmin
    .from('users')
    .update(update)
    .eq('id', target.id)
    .select('id, role, status')
    .single();
  if (error) throw error;

  await logAdminAudit(admin, req, nextStatus === 'suspended' ? 'ACCOUNT_SUSPENDED' : 'ACCOUNT_RESTORED', {
    resourceType: 'user',
    resourceId: target.id,
    targetRole: target.role,
    reason
  });
  return data;
};

const suspendUser = (admin, userId, reason, req) =>
  changeAccountAvailability(admin, userId, 'suspended', reason, req);

const restoreUser = (admin, userId, reason, req) =>
  changeAccountAvailability(admin, userId, 'active', reason, req);

module.exports = {
  listVerificationSubmissions,
  getVerificationSubmission,
  reviewVerificationSubmission,
  listAuditLogs,
  suspendUser,
  restoreUser
};
