const { supabaseAdmin } = require('../../config/supabase');
const AppError = require('../../utils/AppError');
const { ERROR_CODES, USER_ROLES } = require('../../config/constants');
const {
  isBuyerRole,
  isVerifiedSellerProfile,
  mapFarmerProfile,
  mapResellerProfile,
  mapOrder,
  mapUserName
} = require('../../utils/marketplace');

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
  if (!isVerifiedSellerProfile(farmerProfile, farmerUser)) {
    throw new AppError(
      'You must complete National ID verification before accepting sales or receiving payments.',
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

const generateOrderNumber = () => `ORD-${Date.now().toString(36).toUpperCase()}`;

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
  let unitPrice = payload.unitPrice;

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
    unitPrice = unitPrice ?? quote.requested_price ?? listing.price_per_unit;
  } else {
    listing = await getListing(payload.listingId);
    farmerProfile = listing.farmer_id ? await getProfileById('farmer_profiles', listing.farmer_id) : null;
    resellerProfile = listing.reseller_id ? await getProfileById('reseller_profiles', listing.reseller_id) : null;
    unitPrice = unitPrice ?? listing.price_per_unit;
  }

  const sellerProfile = resellerProfile || farmerProfile;
  await ensureFarmerCanReceiveCommerce(sellerProfile);

  const totalAmount = Number(payload.quantity) * Number(unitPrice || 0);
  const { data, error } = await supabaseAdmin
    .from('orders')
    .insert({
      order_number: generateOrderNumber(),
      listing_id: listing.id,
      buyer_id: buyerProfile.id,
      farmer_id: farmerProfile?.id || null,
      reseller_id: resellerProfile?.id || null,
      quantity: payload.quantity,
      quantity_unit: payload.quantityUnit || listing.quantity_unit || 'kg',
      unit_price: unitPrice,
      total_amount: totalAmount,
      currency: listing.currency || 'XAF',
      status: 'pending_payment',
      shipping_address: payload.shippingAddress || null,
      billing_address: payload.billingAddress || null,
      notes: payload.notes || null,
      timeline: [{ event: 'Order created', status: 'pending_payment', date: new Date().toISOString() }]
    })
    .select()
    .single();
  if (error) throw error;

  const [order] = await hydrateOrders([data]);
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

module.exports = {
  listOrders,
  createOrder,
  updateOrderStatus,
  getOrderRowForAccess,
  ensureFarmerCanReceiveCommerce,
  hydrateOrders
};
