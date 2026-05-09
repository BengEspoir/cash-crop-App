const { supabaseAdmin } = require('../../config/supabase');
const AppError = require('../../utils/AppError');
const { ERROR_CODES, USER_ROLES, USER_STATUS } = require('../../config/constants');
const {
  FARMER_VERIFICATION_STATUS,
  isBuyerRole,
  isVerifiedSellerProfile,
  mapFarmerProfile,
  mapResellerProfile,
  mapQuote,
  mapUserName
} = require('../../utils/marketplace');
const listingsService = require('../listings/listings.service');

const isNotFound = (error) => error?.code === 'PGRST116';

const getBuyerProfileForUser = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('buyer_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && !isNotFound(error)) throw error;
  if (!data) throw new AppError('Buyer profile not found', 404, ERROR_CODES.NOT_FOUND);
  return data;
};

const getFarmerProfileForUser = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('farmer_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && !isNotFound(error)) throw error;
  if (!data) throw new AppError('Farmer profile not found', 404, ERROR_CODES.NOT_FOUND);
  return data;
};

const getResellerProfileForUser = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('reseller_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && !isNotFound(error)) throw error;
  if (!data) throw new AppError('Reseller profile not found', 404, ERROR_CODES.NOT_FOUND);
  return data;
};

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

const getProfilesByIds = async (table, ids) => {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (!uniqueIds.length) return {};
  const { data, error } = await supabaseAdmin.from(table).select('*').in('id', uniqueIds);
  if (error) throw error;
  return (data || []).reduce((acc, profile) => {
    acc[profile.id] = profile;
    return acc;
  }, {});
};

const hydrateQuotes = async (quotes) => {
  if (!quotes.length) return [];
  const listingIds = quotes.map((quote) => quote.listing_id).filter(Boolean);
  const farmerProfiles = await getProfilesByIds('farmer_profiles', quotes.map((quote) => quote.farmer_id));
  const resellerProfiles = await getProfilesByIds('reseller_profiles', quotes.map((quote) => quote.reseller_id));
  const buyerProfiles = await getProfilesByIds('buyer_profiles', quotes.map((quote) => quote.buyer_id));
  const users = await getUsersByIds([
    ...Object.values(farmerProfiles).map((profile) => profile.user_id),
    ...Object.values(resellerProfiles).map((profile) => profile.user_id),
    ...Object.values(buyerProfiles).map((profile) => profile.user_id)
  ]);

  const listings = {};
  if (listingIds.length) {
    const { data, error } = await supabaseAdmin.from('listings').select('*').in('id', listingIds);
    if (error) throw error;
    for (const row of data || []) listings[row.id] = row;
  }

  return quotes.map((quote) => {
    const farmerProfile = farmerProfiles[quote.farmer_id];
    const resellerProfile = resellerProfiles[quote.reseller_id];
    const buyerProfile = buyerProfiles[quote.buyer_id];
    const farmerUser = farmerProfile ? users[farmerProfile.user_id] : null;
    const resellerUser = resellerProfile ? users[resellerProfile.user_id] : null;
    const buyerUser = buyerProfile ? users[buyerProfile.user_id] : null;
    const farmer = farmerProfile ? mapFarmerProfile(farmerProfile, farmerUser || {}) : null;
    const seller = resellerProfile
      ? mapResellerProfile(resellerProfile, resellerUser || {})
      : farmer;
    const buyer = buyerProfile ? {
      id: buyerProfile.id,
      userId: buyerProfile.user_id,
      name: buyerProfile.company_name || mapUserName(buyerUser || {}),
      contactName: mapUserName(buyerUser || {})
    } : null;
    const listing = listings[quote.listing_id] ? {
      id: listings[quote.listing_id].id,
      crop: listings[quote.listing_id].crop_name_fallback || 'Crop listing',
      pricePerUnit: Number(listings[quote.listing_id].price_per_unit || 0),
      currency: listings[quote.listing_id].currency || 'XAF'
    } : null;
    return mapQuote(quote, { farmer, seller, buyer, listing });
  });
};

const createQuote = async (user, payload, req) => {
  if (!isBuyerRole(user.role)) {
    throw new AppError('Only buyers can request quotes', 403, ERROR_CODES.FORBIDDEN);
  }

  const buyerProfile = await getBuyerProfileForUser(user.id);
  const listing = await listingsService.getListingById(payload.listingId, { requirePublic: true });
  const sellerUserId = listing.seller?.userId || listing.farmer?.userId;
  const sellerProfile = listing.sellerType === 'reseller'
    ? await listingsService.getResellerProfileForUser(sellerUserId)
    : await listingsService.getFarmerProfileForUser(sellerUserId);

  const { data, error } = await supabaseAdmin
    .from('inquiries')
    .insert({
      listing_id: listing.id,
      farmer_id: listing.sellerType === 'reseller' ? null : sellerProfile.id,
      reseller_id: listing.sellerType === 'reseller' ? sellerProfile.id : null,
      buyer_id: buyerProfile.id,
      message: payload.message,
      requested_qty: payload.quantity || null,
      requested_price: payload.requestedPrice || null,
      currency: payload.currency || listing.currency || 'XAF',
      status: 'pending'
    })
    .select()
    .single();
  if (error) throw error;

  await supabaseAdmin
    .from('listings')
    .update({ inquiry_count: (Number(listing.inquiryCount || 0) + 1) })
    .eq('id', listing.id);

  const [quote] = await hydrateQuotes([data]);
  return {
    quote,
    farmerWarning: quote.seller?.verificationStatus !== FARMER_VERIFICATION_STATUS.VERIFIED
      ? 'This seller account is not yet verified. Please proceed carefully because this profile has not completed National ID verification.'
      : null
  };
};

const listQuotes = async (user) => {
  let query = supabaseAdmin.from('inquiries').select('*').order('created_at', { ascending: false });

  if (isBuyerRole(user.role)) {
    const buyerProfile = await getBuyerProfileForUser(user.id);
    query = query.eq('buyer_id', buyerProfile.id);
  } else if (user.role === USER_ROLES.FARMER) {
    const farmerProfile = await getFarmerProfileForUser(user.id);
    query = query.eq('farmer_id', farmerProfile.id);
  } else if (user.role === USER_ROLES.RESELLER) {
    const resellerProfile = await getResellerProfileForUser(user.id);
    query = query.eq('reseller_id', resellerProfile.id);
  } else if (![USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(user.role)) {
    throw new AppError('Insufficient permissions', 403, ERROR_CODES.FORBIDDEN);
  }

  const { data, error } = await query;
  if (error) throw error;
  const items = await hydrateQuotes(data || []);
  return { items, count: items.length };
};

const getQuoteRow = async (quoteId) => {
  const { data, error } = await supabaseAdmin
    .from('inquiries')
    .select('*')
    .eq('id', quoteId)
    .single();
  if (error && isNotFound(error)) throw new AppError('Quote not found', 404, ERROR_CODES.NOT_FOUND);
  if (error) throw error;
  return data;
};

const assertQuoteAccess = async (user, quote) => {
  if (isBuyerRole(user.role)) {
    const buyerProfile = await getBuyerProfileForUser(user.id);
    if (quote.buyer_id !== buyerProfile.id) {
      throw new AppError('Quote not found for this buyer', 404, ERROR_CODES.NOT_FOUND);
    }
    return { buyerProfile };
  }

  if (user.role === USER_ROLES.FARMER) {
    const farmerProfile = await getFarmerProfileForUser(user.id);
    if (quote.farmer_id !== farmerProfile.id) {
      throw new AppError('Quote not found for this farmer', 404, ERROR_CODES.NOT_FOUND);
    }
    return { farmerProfile };
  }

  if (user.role === USER_ROLES.RESELLER) {
    const resellerProfile = await getResellerProfileForUser(user.id);
    if (quote.reseller_id !== resellerProfile.id) {
      throw new AppError('Quote not found for this reseller', 404, ERROR_CODES.NOT_FOUND);
    }
    return { resellerProfile };
  }

  if ([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(user.role)) {
    return {};
  }

  throw new AppError('Insufficient permissions', 403, ERROR_CODES.FORBIDDEN);
};

const getQuote = async (user, quoteId) => {
  const row = await getQuoteRow(quoteId);
  await assertQuoteAccess(user, row);
  const [quote] = await hydrateQuotes([row]);
  return quote;
};

const updateQuoteStatus = async (user, quoteId, status) => {
  const row = await getQuoteRow(quoteId);
  const { farmerProfile, resellerProfile } = await assertQuoteAccess(user, row);

  if (['accepted', 'completed'].includes(status)) {
    if (![USER_ROLES.FARMER, USER_ROLES.RESELLER].includes(user.role)) {
      throw new AppError('Only sellers can accept or complete quote requests', 403, ERROR_CODES.FORBIDDEN);
    }

    if (!isVerifiedSellerProfile(farmerProfile || resellerProfile, user)) {
      throw new AppError(
        'You must complete National ID verification before accepting sales or receiving payments.',
        403,
        ERROR_CODES.FORBIDDEN
      );
    }
  }

  if (status === 'cancelled' && !isBuyerRole(user.role)) {
    throw new AppError('Only buyers can cancel quote requests', 403, ERROR_CODES.FORBIDDEN);
  }

  const { data, error } = await supabaseAdmin
    .from('inquiries')
    .update({ status })
    .eq('id', quoteId)
    .select()
    .single();
  if (error) throw error;
  const [quote] = await hydrateQuotes([data]);
  return quote;
};

module.exports = {
  createQuote,
  listQuotes,
  getQuote,
  updateQuoteStatus
};
