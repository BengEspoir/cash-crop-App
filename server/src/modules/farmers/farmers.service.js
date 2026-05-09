const { supabaseAdmin } = require('../../config/supabase');
const AppError = require('../../utils/AppError');
const { ERROR_CODES, USER_STATUS } = require('../../config/constants');
const { mapFarmerProfile, mapResellerProfile } = require('../../utils/marketplace');
const listingsService = require('../listings/listings.service');

const isNotFound = (error) => error?.code === 'PGRST116';

const getUsersByIds = async (ids) => {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (!uniqueIds.length) return {};

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, first_name, last_name, email, phone, role, status, region, city, country, created_at')
    .in('id', uniqueIds);
  if (error) throw error;

  return (data || []).reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {});
};

const listFarmers = async (filters = {}) => {
  let profileQuery = supabaseAdmin
    .from('farmer_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.verificationStatus) {
    profileQuery = profileQuery.eq('identity_verification_status', filters.verificationStatus);
  }

  const { data: profiles, error } = await profileQuery.limit(Number(filters.limit || 80));
  if (error) throw error;

  let resellerProfiles = [];
  let resellerError = null;
  let resellerQuery = supabaseAdmin
    .from('reseller_profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (filters.verificationStatus) {
    resellerQuery = resellerQuery.eq('identity_verification_status', filters.verificationStatus);
  }
  const resellerResult = await resellerQuery.limit(Number(filters.limit || 80));
  resellerProfiles = resellerResult.data || [];
  resellerError = resellerResult.error;
  if (resellerError) throw resellerError;

  const users = await getUsersByIds([
    ...(profiles || []).map((profile) => profile.user_id),
    ...resellerProfiles.map((profile) => profile.user_id)
  ]);
  let items = [
    ...(profiles || []).map((profile) => mapFarmerProfile(profile, users[profile.user_id] || {}, { sellerType: 'farmer' })),
    ...resellerProfiles.map((profile) => mapResellerProfile(profile, users[profile.user_id] || {}, { sellerType: 'reseller' }))
  ]
    .filter((farmer) => ![USER_STATUS.SUSPENDED, USER_STATUS.DEACTIVATED].includes(users[farmer.userId]?.status));

  if (filters.query) {
    const q = String(filters.query).toLowerCase();
    items = items.filter((farmer) => [
      farmer.name,
      farmer.contactName,
      farmer.location,
      farmer.primaryCrop,
      farmer.bio
    ].filter(Boolean).some((value) => String(value).toLowerCase().includes(q)));
  }

  return { items, count: items.length };
};

const getFarmerById = async (id) => {
  let { data: profile, error } = await supabaseAdmin
    .from('farmer_profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error && isNotFound(error)) {
    const byUser = await supabaseAdmin
      .from('farmer_profiles')
      .select('*')
      .eq('user_id', id)
      .single();
    profile = byUser.data;
    error = byUser.error;
  }

  let isReseller = false;
  if (error && isNotFound(error)) {
    const resellerById = await supabaseAdmin
      .from('reseller_profiles')
      .select('*')
      .eq('id', id)
      .single();
    profile = resellerById.data;
    error = resellerById.error;
    isReseller = Boolean(profile);
  }

  if (error && isNotFound(error)) {
    const resellerByUser = await supabaseAdmin
      .from('reseller_profiles')
      .select('*')
      .eq('user_id', id)
      .single();
    profile = resellerByUser.data;
    error = resellerByUser.error;
    isReseller = Boolean(profile);
  }

  if (error && isNotFound(error)) throw new AppError('Seller not found', 404, ERROR_CODES.NOT_FOUND);
  if (error) throw error;

  const users = await getUsersByIds([profile.user_id]);
  const listings = await listingsService.listPublicListings(isReseller ? { resellerId: profile.id } : { farmerId: profile.id });
  const mapper = isReseller ? mapResellerProfile : mapFarmerProfile;
  return mapper(profile, users[profile.user_id] || {}, {
    sellerType: isReseller ? 'reseller' : 'farmer',
    listings: listings.items,
    listingCount: listings.count
  });
};

const getFarmerListings = async (id) => {
  const farmer = await getFarmerById(id);
  return { items: farmer.listings || [], count: farmer.listingCount || 0 };
};

module.exports = {
  listFarmers,
  getFarmerById,
  getFarmerListings
};
