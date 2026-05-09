const { supabaseAdmin } = require('../../config/supabase');
const authRepository = require('../auth/auth.repository');
const { USER_ROLES, USER_STATUS } = require('../../config/constants');

const MISSING_SCHEMA_CODES = new Set(['42P01', '42703', 'PGRST200', 'PGRST204', 'PGRST205']);

const isMissingSchema = (error) => {
  const message = `${error?.message || ''} ${error?.details || ''}`.toLowerCase();
  return MISSING_SCHEMA_CODES.has(error?.code) ||
    message.includes('does not exist') ||
    message.includes('could not find') ||
    message.includes('relationship');
};

const safeQuery = async (query, fallback = []) => {
  const { data, error, count } = await query;
  if (!error) {
    return count !== null && count !== undefined ? { data: data || fallback, count } : data || fallback;
  }
  if (isMissingSchema(error)) {
    return fallback;
  }
  throw error;
};

const safeCount = async (table, applyFilter = (query) => query) => {
  const query = applyFilter(supabaseAdmin.from(table).select('*', { count: 'exact', head: true }));
  const result = await safeQuery(query, { count: 0 });
  return result.count || 0;
};

const formatNumber = (value) => {
  const numeric = Number(value || 0);
  return Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(2);
};

const formatCurrency = (value, currency = 'XAF') => {
  const numeric = Number(value || 0);
  return `${currency} ${numeric.toLocaleString('en-CM', { maximumFractionDigits: 0 })}`;
};

const mapListingStatus = (status) => ({
  active: 'verified',
  pending_review: 'pending',
  rejected: 'rejected',
  draft: 'draft',
  archived: 'draft',
  sold_out: 'draft'
}[status] || status || 'draft');

const mapOrderStatus = (status) => String(status || 'pending_payment').replace(/_/g, '-');

const getPrimaryImages = async (listingIds) => {
  if (!listingIds.length) {
    return {};
  }

  const rows = await safeQuery(
    supabaseAdmin
      .from('listing_images')
      .select('listing_id, url, is_primary, display_order')
      .in('listing_id', listingIds)
      .order('is_primary', { ascending: false })
      .order('display_order', { ascending: true }),
    []
  );

  return rows.reduce((acc, image) => {
    if (!acc[image.listing_id]) {
      acc[image.listing_id] = image.url;
    }
    return acc;
  }, {});
};

const getUsersByIds = async (ids) => {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (!uniqueIds.length) {
    return {};
  }

  const users = await safeQuery(
    supabaseAdmin
      .from('users')
      .select('id, first_name, last_name, email, phone, role, status, region, city, country, created_at')
      .in('id', uniqueIds),
    []
  );

  return users.reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {});
};

const mapUserName = (user) => {
  if (!user) {
    return 'Unknown user';
  }
  return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || user.phone || 'Unknown user';
};

const getProfilesByIds = async (table, ids) => {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (!uniqueIds.length) {
    return {};
  }

  const profiles = await safeQuery(
    supabaseAdmin.from(table).select('*').in('id', uniqueIds),
    []
  );

  const usersById = await getUsersByIds(profiles.map((profile) => profile.user_id));

  return profiles.reduce((acc, profile) => {
    acc[profile.id] = {
      ...profile,
      user: usersById[profile.user_id] || null
    };
    return acc;
  }, {});
};

const mapListing = (row, imageByListing = {}) => ({
  id: row.id,
  crop: row.crop_name_fallback || row.crop_name || 'Crop listing',
  quantity: `${formatNumber(row.quantity)} ${row.quantity_unit || 'kg'}`,
  quantityLabel: `${formatNumber(row.quantity)} ${row.quantity_unit || 'kg'} available`,
  location: row.location_name || 'Location pending',
  price: `${row.currency || 'XAF'} ${formatNumber(row.price_per_unit)} / ${row.quantity_unit || 'kg'}`,
  priceValue: Number(row.price_per_unit || 0),
  status: mapListingStatus(row.status),
  farmerId: row.farmer_id,
  grade: row.grade,
  deliveryWindow: row.delivery_window || 'Ready for inspection',
  summary: row.summary || row.description || 'No listing summary yet.',
  specs: row.specs || {},
  imageSrc: imageByListing[row.id] || null,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const mapOrder = (row, listingById = {}, buyerProfiles = {}, farmerProfiles = {}) => {
  const listing = listingById[row.listing_id] || {};
  const buyer = buyerProfiles[row.buyer_id]?.user;
  const farmer = farmerProfiles[row.farmer_id]?.user;
  return {
    id: row.order_number || row.id,
    rawId: row.id,
    crop: listing.crop_name_fallback || listing.crop_name || 'Crop order',
    buyerName: mapUserName(buyer),
    farmerName: mapUserName(farmer),
    quantity: `${formatNumber(row.quantity)} ${row.quantity_unit || 'kg'}`,
    amount: Number(row.total_amount || 0),
    amountLabel: formatCurrency(row.total_amount, row.currency || 'XAF'),
    status: mapOrderStatus(row.status),
    eta: row.eta,
    notes: row.notes || 'No order notes recorded yet.',
    timeline: row.timeline || [],
    createdAt: row.created_at
  };
};

const mapPayment = (row) => ({
  id: row.id,
  party: row.channel || 'Payment channel pending',
  amountLabel: formatCurrency(row.amount, row.currency || 'XAF'),
  status: row.status || 'pending',
  channel: row.channel || 'Not selected',
  createdAt: row.created_at
});

const mapQuote = (row, listingById = {}) => {
  const listing = listingById[row.listing_id] || {};
  return {
    id: row.id,
    listingId: row.listing_id,
    farmerId: row.farmer_id,
    buyerId: row.buyer_id,
    crop: listing.crop_name_fallback || 'Quote request',
    title: listing.crop_name_fallback || 'Quote request',
    message: row.message,
    requestedQty: row.requested_qty,
    requestedPrice: row.requested_price,
    currency: row.currency || 'XAF',
    status: row.status || 'pending',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

const mapNotification = (row) => ({
  id: row.id,
  title: row.title,
  detail: row.content,
  status: row.is_read ? 'verified' : 'pending',
  createdAt: row.created_at
});

const mapDocument = (row) => ({
  id: row.id,
  title: row.title,
  status: row.status || 'pending',
  updatedAt: row.updated_at || row.created_at,
  orderId: row.order_id,
  fileUrl: row.file_url,
  type: row.type
});

const mapActivity = (row) => ({
  id: row.id,
  title: row.event_type || row.event || 'Activity',
  detail: row.metadata ? JSON.stringify(row.metadata) : row.path || 'System activity recorded.',
  status: 'verified',
  createdAt: row.created_at
});

const fetchListings = async (applyFilter = (query) => query, limit = 50) => {
  const rows = await safeQuery(
    applyFilter(
      supabaseAdmin
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)
    ),
    []
  );
  const images = await getPrimaryImages(rows.map((row) => row.id));
  return rows.map((row) => mapListing(row, images));
};

const fetchOrders = async (applyFilter = (query) => query, limit = 50) => {
  const rows = await safeQuery(
    applyFilter(
      supabaseAdmin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)
    ),
    []
  );

  const listingIds = rows.map((row) => row.listing_id).filter(Boolean);
  const listings = listingIds.length
    ? await safeQuery(supabaseAdmin.from('listings').select('*').in('id', listingIds), [])
    : [];
  const listingById = listings.reduce((acc, listing) => {
    acc[listing.id] = listing;
    return acc;
  }, {});
  const buyerProfiles = await getProfilesByIds('buyer_profiles', rows.map((row) => row.buyer_id));
  const farmerProfiles = await getProfilesByIds('farmer_profiles', rows.map((row) => row.farmer_id));

  return rows.map((row) => mapOrder(row, listingById, buyerProfiles, farmerProfiles));
};

const fetchPayments = async (applyFilter = (query) => query, limit = 50) => {
  const rows = await safeQuery(
    applyFilter(
      supabaseAdmin
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)
    ),
    []
  );
  return rows.map(mapPayment);
};

const fetchQuotes = async (applyFilter = (query) => query, limit = 50) => {
  const rows = await safeQuery(
    applyFilter(
      supabaseAdmin
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)
    ),
    []
  );

  const listingIds = rows.map((row) => row.listing_id).filter(Boolean);
  const listings = listingIds.length
    ? await safeQuery(supabaseAdmin.from('listings').select('*').in('id', listingIds), [])
    : [];
  const listingById = listings.reduce((acc, listing) => {
    acc[listing.id] = listing;
    return acc;
  }, {});

  return rows.map((row) => mapQuote(row, listingById));
};

const fetchNotifications = async (userId) => {
  const rows = await safeQuery(
    supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20),
    []
  );
  return rows.map(mapNotification);
};

const fetchActivity = async (limit = 30) => {
  const activityRows = await safeQuery(
    supabaseAdmin
      .from('activity_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit),
    []
  );

  if (activityRows.length) {
    return activityRows.map(mapActivity);
  }

  const auditRows = await safeQuery(
    supabaseAdmin
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit),
    []
  );

  return auditRows.map(mapActivity);
};

const fetchPendingUsers = async () => {
  const rows = await safeQuery(
    supabaseAdmin
      .from('users')
      .select('*, farmer_profiles(*)')
      .eq('role', USER_ROLES.FARMER)
      .eq('status', USER_STATUS.PENDING_REVIEW)
      .order('created_at', { ascending: false }),
    []
  );

  return rows.map((user) => ({
    ...user,
    name: mapUserName(user),
    profile: Array.isArray(user.farmer_profiles) ? user.farmer_profiles[0] : user.farmer_profiles
  }));
};

const fetchConversations = async (userId) => {
  const rows = await safeQuery(
    supabaseAdmin
      .from('conversations')
      .select('*')
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order('last_message_at', { ascending: false })
      .limit(30),
    []
  );

  const users = await getUsersByIds(rows.flatMap((row) => [row.participant_1, row.participant_2]));

  return rows.map((row) => {
    const otherId = row.participant_1 === userId ? row.participant_2 : row.participant_1;
    const participant = users[otherId];
    return {
      id: row.id,
      participant: mapUserName(participant),
      role: participant?.role || 'user',
      preview: 'No messages loaded yet.',
      unread: 0,
      listingId: row.listing_id,
      messages: []
    };
  });
};

const getFarmerDashboard = async (user, req) => {
  await authRepository.logActivityEvent(user.id, 'DASHBOARD_VIEWED', req, {
    role: user.role,
    entityType: 'dashboard',
    entityId: 'farmer'
  });

  const profile = await authRepository.getFarmerProfile(user.id);
  const listings = profile
    ? await fetchListings((query) => query.eq('farmer_id', profile.id), 50)
    : [];
  const orders = profile
    ? await fetchOrders((query) => query.eq('farmer_id', profile.id), 50)
    : [];
  const payments = await fetchPayments((query) => query.eq('payee_id', user.id), 30);
  const quotes = profile
    ? await fetchQuotes((query) => query.eq('farmer_id', profile.id), 50)
    : [];
  const notifications = await fetchNotifications(user.id);
  const conversations = await fetchConversations(user.id);

  return {
    profile,
    metrics: {
      activeListings: listings.filter((listing) => listing.status === 'verified').length,
      openOrders: orders.length,
      openQuotes: quotes.filter((quote) => quote.status === 'pending').length,
      protectedRevenue: formatCurrency(orders.reduce((sum, order) => sum + order.amount, 0)),
      unreadMessages: conversations.reduce((sum, conversation) => sum + (conversation.unread || 0), 0)
    },
    listings,
    quotes,
    orders,
    payments,
    notifications,
    conversations,
    activity: notifications
  };
};

const getBuyerDashboard = async (user, req) => {
  await authRepository.logActivityEvent(user.id, 'DASHBOARD_VIEWED', req, {
    role: user.role,
    entityType: 'dashboard',
    entityId: 'buyer'
  });

  const profile = await authRepository.getBuyerProfile(user.id);
  const orders = profile
    ? await fetchOrders((query) => query.eq('buyer_id', profile.id), 50)
    : [];
  const quotes = profile
    ? await fetchQuotes((query) => query.eq('buyer_id', profile.id), 50)
    : [];
  const listings = await fetchListings((query) => query.eq('status', 'active'), 20);
  const notifications = await fetchNotifications(user.id);
  const conversations = await fetchConversations(user.id);
  const documents = orders.length
    ? (await safeQuery(
      supabaseAdmin
        .from('export_documents')
        .select('*')
        .in('order_id', orders.map((order) => order.rawId))
        .order('created_at', { ascending: false }),
      []
    )).map(mapDocument)
    : [];

  return {
    profile,
    metrics: {
      activeOrders: orders.length,
      savedListings: 0,
      openQuotes: quotes.filter((quote) => quote.status === 'pending').length
    },
    orders,
    listings,
    savedListings: [],
    quotes,
    documents,
    conversations,
    notifications,
    activity: notifications
  };
};

const getAdminDashboard = async (user, req) => {
  await authRepository.logActivityEvent(user.id, 'DASHBOARD_VIEWED', req, {
    role: user.role,
    entityType: 'dashboard',
    entityId: 'admin'
  });

  const pendingUsers = await fetchPendingUsers();
  const users = await safeQuery(
    supabaseAdmin
      .from('users')
      .select('id, role, status, first_name, last_name, email, phone, region, city, country, created_at')
      .order('created_at', { ascending: false })
      .limit(100),
    []
  );
  const listings = await fetchListings((query) => query, 100);
  const orders = await fetchOrders((query) => query, 100);
  const payments = await fetchPayments((query) => query, 100);
  const activity = await fetchActivity(40);
  const logistics = await safeQuery(supabaseAdmin.from('logistics').select('*').order('created_at', { ascending: false }).limit(100), []);
  const inspections = await safeQuery(supabaseAdmin.from('inspections').select('*').order('created_at', { ascending: false }).limit(100), []);
  const disputes = await safeQuery(supabaseAdmin.from('disputes').select('*').order('created_at', { ascending: false }).limit(100), []);

  return {
    metrics: {
      pendingReviews: pendingUsers.length,
      totalUsers: await safeCount('users'),
      activeUsers: await safeCount('users', (query) => query.eq('status', USER_STATUS.ACTIVE)),
      totalListings: listings.length,
      totalOrders: orders.length,
      protectedVolume: formatCurrency(orders.reduce((sum, order) => sum + order.amount, 0)),
      activeDisputes: disputes.filter((dispute) => dispute.status === 'open').length
    },
    pendingUsers,
    users: users.map((row) => ({
      ...row,
      name: mapUserName(row)
    })),
    listings,
    orders,
    payments,
    logistics,
    inspections,
    disputes,
    activity
  };
};

module.exports = {
  getFarmerDashboard,
  getBuyerDashboard,
  getAdminDashboard,
  fetchPendingUsers,
  fetchActivity
};
