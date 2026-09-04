const { supabaseAdmin } = require('../../config/supabase');
const AppError = require('../../utils/AppError');
const { ERROR_CODES, USER_ROLES } = require('../../config/constants');
const {
  isBuyerRole,
  mapFarmerProfile,
  mapResellerProfile,
  mapOrder,
  mapUserName
} = require('../../utils/marketplace');
const logisticsRepository = require('../logistics/logistics.repository');
const { calculatePlatformFee } = require('../../utils/platformFee');

const isNotFound = (error) => error?.code === 'PGRST116';

const getProfileByUser = async (table, userId) => {
  const { data, error } = await supabaseAdmin.from(table).select('*').eq('user_id', userId).single();
  if (error && isNotFound(error)) throw new AppError('Profile not found', 404, ERROR_CODES.NOT_FOUND);
  if (error) throw error;
  return data;
};

const getProfileById = async (table, id) => {
  const { data, error } = await supabaseAdmin.from(table).select('*').eq('id', id).single();
  if (error && isNotFound(error)) throw new AppError('Profile not found', 404, ERROR_CODES.NOT_FOUND);
  if (error) throw error;
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

const getListing = async (id) => {
  const { data, error } = await supabaseAdmin.from('listings').select('*').eq('id', id).single();
  if (error && isNotFound(error)) throw new AppError('Listing not found', 404, ERROR_CODES.NOT_FOUND);
  if (error) throw error;
  return data;
};

const getQuote = async (id) => {
  const { data, error } = await supabaseAdmin.from('inquiries').select('*').eq('id', id).single();
  if (error && isNotFound(error)) throw new AppError('Quote not found', 404, ERROR_CODES.NOT_FOUND);
  if (error) throw error;
  return data;
};

const ensureFarmerCanReceiveCommerce = async (farmerProfile) => {
  const users = await getUsersByIds([farmerProfile.user_id]);
  const farmerUser = users[farmerProfile.user_id];
  if (!farmerUser || farmerUser.status !== 'active') {
    throw new AppError(
      'This seller account is not currently available for trade.',
      403,
      ERROR_CODES.FORBIDDEN
    );
  }
  return farmerUser;
};

const hydrateOrders = async (orders) => {
  if (!orders.length) return [];
  const listingIds = orders.map((order) => order.listing_id).filter(Boolean);
  const buyerProfiles = {};
  const farmerProfiles = {};
  const resellerProfiles = {};

  const { data: buyers, error: buyerError } = await supabaseAdmin
    .from('buyer_profiles')
    .select('*')
    .in('id', orders.map((order) => order.buyer_id));
  if (buyerError) throw buyerError;
  for (const profile of buyers || []) buyerProfiles[profile.id] = profile;

  const farmerIds = orders.map((order) => order.farmer_id).filter(Boolean);
  if (farmerIds.length) {
    const { data: farmers, error: farmerError } = await supabaseAdmin
      .from('farmer_profiles')
      .select('*')
      .in('id', farmerIds);
    if (farmerError) throw farmerError;
    for (const profile of farmers || []) farmerProfiles[profile.id] = profile;
  }

  const resellerIds = orders.map((order) => order.reseller_id).filter(Boolean);
  if (resellerIds.length) {
    const { data: resellers, error: resellerError } = await supabaseAdmin
      .from('reseller_profiles')
      .select('*')
      .in('id', resellerIds);
    if (resellerError) throw resellerError;
    for (const profile of resellers || []) resellerProfiles[profile.id] = profile;
  }

  const listings = {};
  if (listingIds.length) {
    const { data, error } = await supabaseAdmin.from('listings').select('*').in('id', listingIds);
    if (error) throw error;
    for (const row of data || []) listings[row.id] = row;
  }

  const users = await getUsersByIds([
    ...Object.values(buyerProfiles).map((profile) => profile.user_id),
    ...Object.values(farmerProfiles).map((profile) => profile.user_id),
    ...Object.values(resellerProfiles).map((profile) => profile.user_id)
  ]);

  return orders.map((order) => {
    const buyerProfile = buyerProfiles[order.buyer_id];
    const farmerProfile = farmerProfiles[order.farmer_id];
    const resellerProfile = resellerProfiles[order.reseller_id];
    const buyerUser = buyerProfile ? users[buyerProfile.user_id] : null;
    const farmerUser = farmerProfile ? users[farmerProfile.user_id] : null;
    const resellerUser = resellerProfile ? users[resellerProfile.user_id] : null;
    const seller = resellerProfile
      ? mapResellerProfile(resellerProfile, resellerUser || {})
      : (farmerProfile ? mapFarmerProfile(farmerProfile, farmerUser || {}) : null);
    return mapOrder(order, {
      listing: listings[order.listing_id],
      buyer: buyerProfile ? { id: buyerProfile.id, name: buyerProfile.company_name || mapUserName(buyerUser || {}) } : null,
      farmer: farmerProfile ? mapFarmerProfile(farmerProfile, farmerUser || {}) : null,
      seller
    });
  });
};

const normalizeText = (value) => {
  const text = String(value || '').trim();
  return text || null;
};

const estimateLogisticsFee = async ({ originRegion, originCity, destinationRegion, destinationCity }) => {
  if (!originRegion || !destinationRegion) {
    return null;
  }

  return logisticsRepository.findLogisticsRate({
    originRegion,
    originCity: originCity || null,
    destinationRegion,
    destinationCity: destinationCity || null
  });
};

const listOrders = async (user) => {
  let query = supabaseAdmin.from('orders').select('*').order('created_at', { ascending: false });

  if (isBuyerRole(user.role)) {
    const buyerProfile = await getProfileByUser('buyer_profiles', user.id);
    query = query.eq('buyer_id', buyerProfile.id);
  } else if (user.role === USER_ROLES.FARMER) {
    const farmerProfile = await getProfileByUser('farmer_profiles', user.id);
    query = query.eq('farmer_id', farmerProfile.id);
  } else if (user.role === USER_ROLES.RESELLER) {
    const resellerProfile = await getProfileByUser('reseller_profiles', user.id);
    query = query.eq('reseller_id', resellerProfile.id);
  } else if (![USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(user.role)) {
    throw new AppError('Insufficient permissions', 403, ERROR_CODES.FORBIDDEN);
  }

  const { data, error } = await query;
  if (error) throw error;
  const items = await hydrateOrders(data || []);
  return { items, count: items.length };
};

const createOrder = async (user, payload) => {
  if (!isBuyerRole(user.role)) {
    throw new AppError('Only buyers can initiate purchase orders', 403, ERROR_CODES.FORBIDDEN);
  }

  const buyerProfile = await getProfileByUser('buyer_profiles', user.id);
  let listing;
  let farmerProfile;
  let resellerProfile;

  if (payload.quoteId) {
    const quote = await getQuote(payload.quoteId);
    if (quote.buyer_id !== buyerProfile.id) {
      throw new AppError('Quote not found for this buyer', 404, ERROR_CODES.NOT_FOUND);
    }
    if (quote.status !== 'accepted') {
      throw new AppError('The farmer must accept this quote before an order can be created', 403, ERROR_CODES.FORBIDDEN);
    }
    listing = await getListing(quote.listing_id);
    farmerProfile = quote.farmer_id ? await getProfileById('farmer_profiles', quote.farmer_id) : null;
    resellerProfile = quote.reseller_id ? await getProfileById('reseller_profiles', quote.reseller_id) : null;
  } else {
    listing = await getListing(payload.listingId);
    farmerProfile = listing.farmer_id ? await getProfileById('farmer_profiles', listing.farmer_id) : null;
    resellerProfile = listing.reseller_id ? await getProfileById('reseller_profiles', listing.reseller_id) : null;
  }

  const sellerProfile = resellerProfile || farmerProfile;
  const sellerUser = await ensureFarmerCanReceiveCommerce(sellerProfile);

  const destinationRegion = normalizeText(payload.destinationRegion) || buyerProfile.region || null;
  const destinationCity = normalizeText(payload.destinationCity) || buyerProfile.city || null;
  const originRegion = sellerUser?.region || null;
  const originCity = sellerUser?.city || null;

  let logisticsFee = 0;
  if (payload.logisticsRequired) {
    const matchedRate = await estimateLogisticsFee({
      originRegion,
      originCity,
      destinationRegion,
      destinationCity
    });

    if (!matchedRate) {
      throw new AppError(
        'No AgriculNet logistics rate is configured for this route yet.',
        400,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    logisticsFee = Number(matchedRate.fee_amount || 0);
  }

  const { data, error } = await supabaseAdmin.rpc('create_marketplace_order', {
    p_buyer_user_id: user.id,
    p_listing_id: payload.quoteId ? null : listing.id,
    p_quote_id: payload.quoteId || null,
    p_quantity: Number(payload.quantity),
    p_requested_quantity_unit: payload.quantityUnit || listing.quantity_unit || 'kg',
    p_logistics_required: Boolean(payload.logisticsRequired),
    p_logistics_fee: logisticsFee,
    p_shipping_address: payload.shippingAddress || null,
    p_billing_address: payload.billingAddress || null,
    p_notes: payload.notes || null,
    p_metadata: {
      originRegion,
      originCity,
      destinationRegion,
      destinationCity
    },
    p_idempotency_key: payload.idempotencyKey || null
  });
  if (error) throw error;

  const fee = calculatePlatformFee(data.base_amount);
  const { data: pricedOrder, error: pricingError } = await supabaseAdmin
    .from('orders')
    .update({
      platform_commission: fee.platformFee,
      seller_net_amount: fee.sellerNetAmount,
      metadata: {
        ...(data.metadata || {}),
        platformFee: fee
      }
    })
    .eq('id', data.id)
    .select()
    .single();
  if (pricingError) throw pricingError;

  const [order] = await hydrateOrders([pricedOrder]);
  return order;
};

const getOrderRowForAccess = async (user, orderId) => {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .or(`id.eq.${orderId},order_number.eq.${orderId}`)
    .single();
  if (error && isNotFound(error)) throw new AppError('Order not found', 404, ERROR_CODES.NOT_FOUND);
  if (error) throw error;

  if (isBuyerRole(user.role)) {
    const buyerProfile = await getProfileByUser('buyer_profiles', user.id);
    if (data.buyer_id !== buyerProfile.id) throw new AppError('Order not found for this buyer', 404, ERROR_CODES.NOT_FOUND);
  } else if (user.role === USER_ROLES.FARMER) {
    const farmerProfile = await getProfileByUser('farmer_profiles', user.id);
    if (data.farmer_id !== farmerProfile.id) throw new AppError('Order not found for this farmer', 404, ERROR_CODES.NOT_FOUND);
  } else if (user.role === USER_ROLES.RESELLER) {
    const resellerProfile = await getProfileByUser('reseller_profiles', user.id);
    if (data.reseller_id !== resellerProfile.id) throw new AppError('Order not found for this reseller', 404, ERROR_CODES.NOT_FOUND);
  } else if (![USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(user.role)) {
    throw new AppError('Insufficient permissions', 403, ERROR_CODES.FORBIDDEN);
  }

  return data;
};

const updateOrderStatus = async (user, orderId, status) => {
  const order = await getOrderRowForAccess(user, orderId);

  if (['confirmed', 'processing', 'in_transit', 'completed'].includes(status)) {
    const sellerProfile = order.reseller_id
      ? await getProfileById('reseller_profiles', order.reseller_id)
      : await getProfileById('farmer_profiles', order.farmer_id);
    await ensureFarmerCanReceiveCommerce(sellerProfile);
  }

  if (status === 'cancelled' && !(isBuyerRole(user.role) || [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(user.role))) {
    throw new AppError('Only buyers or admins can cancel orders', 403, ERROR_CODES.FORBIDDEN);
  }

  const timeline = Array.isArray(order.timeline) ? order.timeline : [];
  timeline.push({ event: `Order marked ${status}`, status, date: new Date().toISOString() });

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ status, timeline })
    .eq('id', order.id)
    .select()
    .single();
  if (error) throw error;

  const [mapped] = await hydrateOrders([data]);
  return mapped;
};

const confirmOrderReceipt = async (user, orderId) => {
  if (!isBuyerRole(user.role)) {
    throw new AppError('Only the purchasing buyer can confirm receipt', 403, ERROR_CODES.FORBIDDEN);
  }
  const order = await getOrderRowForAccess(user, orderId);
  const { data, error } = await supabaseAdmin.rpc('confirm_marketplace_order_receipt', {
    p_order_id: order.id,
    p_buyer_user_id: user.id,
    p_confirmed_at: new Date().toISOString()
  });
  if (error) {
    const message = [error.message, error.details, error.hint].filter(Boolean).join(' ');
    if (message.includes('ORDER_NOT_READY_FOR_RECEIPT')) {
      throw new AppError('Receipt can be confirmed only after delivery', 409, 'ORDER_NOT_READY_FOR_RECEIPT');
    }
    if (message.includes('ORDER_RECEIPT_BLOCKED_BY_PROBLEM')) {
      throw new AppError('Resolve the reported problem before confirming receipt', 409, 'ORDER_RECEIPT_BLOCKED');
    }
    if (message.includes('ORDER_PAYMENT_NOT_CONFIRMED')) {
      throw new AppError('Receipt can be confirmed only after payment succeeds', 409, 'ORDER_PAYMENT_NOT_CONFIRMED');
    }
    throw error;
  }
  const [mapped] = await hydrateOrders([data.order]);
  return { order: mapped, confirmed: Boolean(data.confirmed) };
};

module.exports = {
  listOrders,
  createOrder,
  updateOrderStatus,
  confirmOrderReceipt,
  getOrderRowForAccess,
  ensureFarmerCanReceiveCommerce,
  hydrateOrders
};
