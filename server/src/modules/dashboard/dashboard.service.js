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
      .select('id, first_name, last_name, email, phone, role, status, region, city, country, profile_image_url, created_at')
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

const RESOURCE_KEYS = new Set([
  'users',
  'pendingUsers',
  'listings',
  'orders',
  'payments',
  'logistics',
  'inspections',
  'disputes',
  'activity',
  'quotes',
  'documents',
  'conversations',
  'notifications',
  'savedListings'
]);

const normalize = (value) => String(value || '').toLowerCase();

const countryFilterTerms = (value) => {
  const raw = String(value || '').trim();
  if (!raw || raw === 'all') return [];
  const terms = [normalize(raw)];
  if (/^[a-z]{2}$/i.test(raw)) {
    try {
      const display = new Intl.DisplayNames(['en'], { type: 'region' }).of(raw.toUpperCase());
      if (display) terms.push(normalize(display));
    } catch {
      /* ignore unsupported region display */
    }
  }
  return [...new Set(terms)];
};

const itemMatchesSearch = (item, q) => {
  if (!q) return true;
  const haystack = [
    item.id,
    item.rawId,
    item.name,
    item.email,
    item.phone,
    item.role,
    item.status,
    item.region,
    item.country,
    item.crop,
    item.title,
    item.subject,
    item.location,
    item.buyerName,
    item.farmerName,
    item.participant,
    item.channel,
    item.amountLabel,
    item.detail
  ].filter(Boolean).join(' ').toLowerCase();
  return haystack.includes(q);
};

const itemMatchesFilters = (item, filters = {}) => {
  const q = normalize(filters.q).trim();
  if (!itemMatchesSearch(item, q)) return false;
  if (filters.status && filters.status !== 'all' && normalize(item.status) !== normalize(filters.status)) return false;
  if (filters.role && filters.role !== 'all' && normalize(item.role) !== normalize(filters.role)) return false;
  if (filters.region && filters.region !== 'all') {
    const region = normalize(item.region || item.location || item.country);
    if (!region.includes(normalize(filters.region))) return false;
  }
  if (filters.country && filters.country !== 'all') {
    const country = normalize([item.country, item.location, item.region].filter(Boolean).join(' '));
    const terms = countryFilterTerms(filters.country);
    if (!terms.some((term) => country.includes(term))) return false;
  }
  if (filters.crop && filters.crop !== 'all' && !normalize(item.crop || item.title).includes(normalize(filters.crop))) return false;
  if (filters.grade && filters.grade !== 'all' && normalize(item.grade) !== normalize(filters.grade)) return false;
  if (filters.priority && filters.priority !== 'all' && normalize(item.priority) !== normalize(filters.priority)) return false;

  const dateValue = item.createdAt || item.created_at || item.updatedAt || item.lastMessageAt;
  if (filters.dateFrom && dateValue && new Date(dateValue) < new Date(filters.dateFrom)) return false;
  if (filters.dateTo && dateValue) {
    const end = new Date(filters.dateTo);
    end.setHours(23, 59, 59, 999);
    if (new Date(dateValue) > end) return false;
  }
  return true;
};

const sortItems = (items, sort = 'newest') => {
  const copy = [...items];
  const value = normalize(sort);
  if (value === 'oldest') {
    return copy.sort((a, b) => new Date(a.createdAt || a.created_at || 0) - new Date(b.createdAt || b.created_at || 0));
  }
  if (value === 'amount_desc') {
    return copy.sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0));
  }
  if (value === 'name_asc') {
    return copy.sort((a, b) => String(a.name || a.crop || a.title || '').localeCompare(String(b.name || b.crop || b.title || '')));
  }
  return copy.sort((a, b) => new Date(b.createdAt || b.created_at || b.updatedAt || 0) - new Date(a.createdAt || a.created_at || a.updatedAt || 0));
};

const applyDashboardFilters = (dashboard, filters = {}) => {
  const limit = Math.min(500, Math.max(1, Number(filters.limit) || 100));
  const resource = RESOURCE_KEYS.has(filters.resource) ? filters.resource : null;
  const next = { ...dashboard };
  const counts = {};

  for (const key of RESOURCE_KEYS) {
    if (!Array.isArray(dashboard[key])) continue;
    if (resource && key !== resource) {
      next[key] = dashboard[key];
      counts[key] = dashboard[key].length;
      continue;
    }
    const filtered = sortItems(dashboard[key].filter((item) => itemMatchesFilters(item, filters)), filters.sort).slice(0, limit);
    next[key] = filtered;
    counts[key] = filtered.length;
  }

  next.filters = {
    resource,
    q: filters.q || '',
    status: filters.status || 'all',
    role: filters.role || 'all',
    region: filters.region || 'all',
    country: filters.country || 'all',
    crop: filters.crop || 'all',
    grade: filters.grade || 'all',
    priority: filters.priority || 'all',
    dateFrom: filters.dateFrom || '',
    dateTo: filters.dateTo || '',
    sort: filters.sort || 'newest',
    limit
  };
  next.filteredCounts = counts;
  return next;
};

const csvEscape = (value) => {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const flattenForCsv = (item) => ({
  id: item.id || item.rawId || '',
  name: item.name || item.crop || item.title || item.subject || item.participant || '',
  status: item.status || '',
  role: item.role || '',
  region: item.region || item.location || item.country || '',
  amount: item.amountLabel || item.amount || '',
  createdAt: item.createdAt || item.created_at || '',
  updatedAt: item.updatedAt || item.updated_at || '',
  detail: item.detail || item.summary || item.description || item.message || ''
});

const toCsv = (items) => {
  const headers = ['id', 'name', 'status', 'role', 'region', 'amount', 'createdAt', 'updatedAt', 'detail'];
  const rows = items.map((item) => {
    const flat = flattenForCsv(item);
    return headers.map((header) => csvEscape(flat[header])).join(',');
  });
  return [headers.join(','), ...rows].join('\n');
};

const dashboardReportToCsv = (dashboard) => {
  const headers = ['section', 'id', 'name', 'status', 'value', 'detail'];
  const rows = [];

  for (const [key, value] of Object.entries(dashboard.metrics || {})) {
    rows.push(['metric', key, key, '', value, '']);
  }

  const appendRows = (section, items = []) => {
    for (const item of items) {
      rows.push([
        section,
        item.id || item.rawId || '',
        item.name || item.crop || item.title || item.subject || '',
        item.status || '',
        item.amountLabel || item.amount || '',
        item.detail || item.summary || item.description || item.location || ''
      ]);
    }
  };

  const needsReview = (item) => ['pending', 'open', 'under_review', 'review', 'flagged', 'disputed'].includes(String(item.status || '').toLowerCase());

  appendRows('pending_user', dashboard.pendingUsers || []);
  appendRows('pending_listing', (dashboard.listings || []).filter(needsReview));
  appendRows('pending_order', (dashboard.orders || []).filter(needsReview));
  appendRows('pending_dispute', (dashboard.disputes || []).filter(needsReview));

  return [headers.join(','), ...rows.map((row) => row.map(csvEscape).join(','))].join('\n');
};

const getFarmerDashboard = async (user, req, filters = {}) => {
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

  return applyDashboardFilters({
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
  }, filters);
};

const getBuyerDashboard = async (user, req, filters = {}) => {
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

  return applyDashboardFilters({
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
  }, filters);
};

const getAdminDashboard = async (user, req, filters = {}) => {
  await authRepository.logActivityEvent(user.id, 'DASHBOARD_VIEWED', req, {
    role: user.role,
    entityType: 'dashboard',
    entityId: 'admin'
  });

  const pendingUsers = await fetchPendingUsers();
  const users = await safeQuery(
    supabaseAdmin
      .from('users')
      .select('id, role, status, first_name, last_name, email, phone, region, city, country, profile_image_url, created_at')
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

  return applyDashboardFilters({
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
  }, filters);
};

const exportDashboard = async (role, user, req, filters = {}) => {
  if (role === 'admin' && filters.resource === 'report') {
    const dashboard = await getAdminDashboard(user, req, { ...filters, resource: undefined });
    return {
      filename: 'admin-dashboard-report.csv',
      content: dashboardReportToCsv(dashboard)
    };
  }

  const resource = RESOURCE_KEYS.has(filters.resource) ? filters.resource : role === 'admin' ? 'users' : 'orders';
  const dashboard = role === 'admin'
    ? await getAdminDashboard(user, req, { ...filters, resource })
    : role === 'farmer'
      ? await getFarmerDashboard(user, req, { ...filters, resource })
      : await getBuyerDashboard(user, req, { ...filters, resource });
  const items = Array.isArray(dashboard[resource]) ? dashboard[resource] : [];
  return {
    filename: `${role}-${resource}-${new Date().toISOString().slice(0, 10)}.csv`,
    content: toCsv(items)
  };
};

module.exports = {
  getFarmerDashboard,
  getBuyerDashboard,
  getAdminDashboard,
  exportDashboard,
  fetchPendingUsers,
  fetchActivity
};
