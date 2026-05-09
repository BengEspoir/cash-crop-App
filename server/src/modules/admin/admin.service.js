const { supabaseAdmin } = require('../../config/supabase');
const env = require('../../config/env');
const AppError = require('../../utils/AppError');
const { ERROR_CODES } = require('../../config/constants');
const { mapFarmerProfile, mapResellerProfile, normalizeVerificationStatus } = require('../../utils/marketplace');
const authService = require('../auth/auth.service');

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

module.exports = {
  listVerificationSubmissions,
  getVerificationSubmission,
  reviewVerificationSubmission
};
