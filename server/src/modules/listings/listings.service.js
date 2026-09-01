const { supabaseAdmin } = require('../../config/supabase');
const AppError = require('../../utils/AppError');
const { ERROR_CODES, USER_ROLES } = require('../../config/constants');
const {
  mapFarmerProfile,
  mapResellerProfile,
  mapListing
} = require('../../utils/marketplace');

const isNotFound = (error) => error?.code === 'PGRST116';

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

const normalizeQuantityUnit = value => {
  const unit = normalize(value).replace(/s$/, '');
  if (['mt', 'ton', 'tonne', 'metric ton'].includes(unit)) return 'mt';
  if (['kg', 'kilogram'].includes(unit)) return 'kg';
  if (unit === 'bag') return 'bag';
  if (unit === 'bunch') return 'bunch';
  return unit;
};

const quantityInKg = (value, unit) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return null;
  const normalizedUnit = normalizeQuantityUnit(unit);
  if (normalizedUnit === 'mt') return amount * 1000;
  if (normalizedUnit === 'kg') return amount;
  if (normalizedUnit === 'bag') return amount * 80;
  return null;
};

const hasMinimumQuantity = (item, requestedValue, requestedUnit) => {
  const minimum = Number(requestedValue);
  if (!Number.isFinite(minimum)) return true;
  const listingUnit = normalizeQuantityUnit(item.quantityUnit);
  const targetUnit = normalizeQuantityUnit(requestedUnit);
  if (!targetUnit || listingUnit === targetUnit) {
    return Number(item.quantityValue || 0) >= minimum;
  }
  const listingKg = quantityInKg(item.quantityValue, listingUnit);
  const targetKg = quantityInKg(minimum, targetUnit);
  return listingKg !== null && targetKg !== null && listingKg >= targetKg;
};

const listingSearchText = item => normalize([
  item.crop,
  item.summary,
  item.description,
  item.grade,
  item.deliveryWindow,
  item.location,
  item.country,
  item.quantity,
  item.price,
  item.sellerType,
  item.seller?.name,
  item.seller?.displayName,
  item.seller?.businessName,
  item.seller?.cooperativeName,
  item.seller?.region,
  item.seller?.city,
  item.seller?.country
].filter(Boolean).join(' '));

const queryTokens = value => normalize(value)
  .split(/\s+/)
  .map(token => token.replace(/[^a-z0-9À-ÿ-]/gi, ''))
  .filter(token => token.length > 1)
  .filter(token => !['find', 'show', 'me', 'with', 'from', 'the', 'and', 'available', 'in', 'at', 'to', 'of', 'for'].includes(token));

const getFarmerProfileForUser = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('farmer_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && !isNotFound(error)) throw error;
  if (!data) {
    throw new AppError('Farmer profile not found', 404, ERROR_CODES.NOT_FOUND);
  }
  return data;
};

const getResellerProfileForUser = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('reseller_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && !isNotFound(error)) throw error;
  if (!data) {
    throw new AppError('Reseller profile not found', 404, ERROR_CODES.NOT_FOUND);
  }
  return data;
};

const getSellerProfileForUser = async (user) => {
  if (user.role === USER_ROLES.RESELLER) {
    const profile = await getResellerProfileForUser(user.id);
    return { profile, sellerType: 'reseller' };
  }

  const profile = await getFarmerProfileForUser(user.id);
  return { profile, sellerType: 'farmer' };
};

const getUsersByIds = async (ids) => {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (!uniqueIds.length) return {};

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, first_name, last_name, email, phone, role, status, region, city, country, profile_image_url, created_at')
    .in('id', uniqueIds);
  if (error) throw error;

  return (data || []).reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {});
};

const getFarmerProfilesByIds = async (ids) => {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (!uniqueIds.length) return {};

  const { data, error } = await supabaseAdmin
    .from('farmer_profiles')
    .select('*')
    .in('id', uniqueIds);
  if (error) throw error;

  const users = await getUsersByIds((data || []).map((profile) => profile.user_id));
  return (data || []).reduce((acc, profile) => {
    const user = users[profile.user_id] || {};
    acc[profile.id] = mapFarmerProfile(profile, user);
    return acc;
  }, {});
};

const getResellerProfilesByIds = async (ids) => {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (!uniqueIds.length) return {};

  const { data, error } = await supabaseAdmin
    .from('reseller_profiles')
    .select('*')
    .in('id', uniqueIds);
  if (error) throw error;

  const users = await getUsersByIds((data || []).map((profile) => profile.user_id));
  return (data || []).reduce((acc, profile) => {
    const user = users[profile.user_id] || {};
    acc[profile.id] = mapResellerProfile(profile, user);
    return acc;
  }, {});
};

const getImagesByListingIds = async (listingIds) => {
  const uniqueIds = [...new Set(listingIds.filter(Boolean))];
  if (!uniqueIds.length) return { imageByListing: {}, imagesByListing: {} };

  const { data, error } = await supabaseAdmin
    .from('listing_images')
    .select('*')
    .in('listing_id', uniqueIds)
    .order('is_primary', { ascending: false })
    .order('display_order', { ascending: true });
  if (error) throw error;

  const imageByListing = {};
  const imagesByListing = {};
  for (const image of data || []) {
    if (!imageByListing[image.listing_id]) imageByListing[image.listing_id] = image.url;
    imagesByListing[image.listing_id] = imagesByListing[image.listing_id] || [];
    imagesByListing[image.listing_id].push(image);
  }

  return { imageByListing, imagesByListing };
};

const mapListings = async (rows) => {
  const farmers = await getFarmerProfilesByIds(rows.map((row) => row.farmer_id));
  const resellers = await getResellerProfilesByIds(rows.map((row) => row.reseller_id));
  const { imageByListing, imagesByListing } = await getImagesByListingIds(rows.map((row) => row.id));

  return rows.map((row) => {
    const seller = row.reseller_id ? resellers[row.reseller_id] : farmers[row.farmer_id];
    return mapListing(row, {
      farmer: farmers[row.farmer_id] || null,
      seller: seller || null,
      imageByListing,
      images: imagesByListing[row.id] || []
    });
  });
};

const listPublicListings = async (filters = {}) => {
  let query = supabaseAdmin
    .from('listings')
    .select('*')
    .neq('status', 'archived')
    .order('created_at', { ascending: false });

  if (filters.publicOnly !== false) {
    query = query.eq('status', 'active');
  } else if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.farmerId) query = query.eq('farmer_id', filters.farmerId);
  if (filters.resellerId) query = query.eq('reseller_id', filters.resellerId);
  if (filters.sellerId) {
    query = query.or(`farmer_id.eq.${filters.sellerId},reseller_id.eq.${filters.sellerId}`);
  }
  const requestedLimit = Math.min(100, Math.max(1, Number(filters.limit || 80)));
  const { data, error } = await query.limit(requestedLimit);
  if (error) throw error;

  let items = await mapListings(data || []);
  if (filters.query && !filters.crop && !filters.region) {
    const tokens = queryTokens(filters.query);
    items = items.filter((item) => {
      const haystack = listingSearchText(item);
      return tokens.length ? tokens.every(token => haystack.includes(token)) : true;
    });
  }
  if (filters.crop) {
    const crop = normalize(filters.crop);
    items = items.filter(item => normalize(item.crop).includes(crop));
  }
  if (filters.region) {
    const region = normalize(filters.region);
    items = items.filter(item => listingSearchText(item).includes(region));
  }
  if (filters.sellerType) {
    items = items.filter(item => item.sellerType === filters.sellerType);
  }
  if (filters.verifiedOnly) {
    items = items.filter(item => item.sellerVerificationStatus === 'verified');
  }
  if (filters.exportReady) {
    items = items.filter(item => item.exportReady);
  }
  if (filters.availability) {
    items = items.filter(item => Number(item.quantityValue || 0) > 0);
  }
  if (filters.minQuantity !== undefined) {
    items = items.filter(item => hasMinimumQuantity(
      item,
      filters.minQuantity,
      filters.quantityUnit
    ));
  }
  if (filters.maxPrice !== undefined) {
    const maxPrice = Number(filters.maxPrice);
    if (Number.isFinite(maxPrice)) {
      items = items.filter(item => Number(item.priceValue || 0) <= maxPrice);
    }
  }
  if (filters.country && filters.country !== 'all') {
    const terms = countryFilterTerms(filters.country);
    items = items.filter((item) => {
      const haystack = normalize([item.country, item.location, item.seller?.country, item.farmer?.country].filter(Boolean).join(' '));
      return terms.some((term) => haystack.includes(term));
    });
  }
  if (filters.sort === 'price-asc') {
    items.sort((a, b) => Number(a.priceValue || 0) - Number(b.priceValue || 0));
  } else if (filters.sort === 'price-desc') {
    items.sort((a, b) => Number(b.priceValue || 0) - Number(a.priceValue || 0));
  } else {
    items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }
  return { items, count: items.length };
};

const getListingById = async (id, { requirePublic = false } = {}) => {
  let query = supabaseAdmin.from('listings').select('*').eq('id', id);
  if (requirePublic) query = query.eq('status', 'active');

  const { data, error } = await query.single();
  if (error && isNotFound(error)) throw new AppError('Listing not found', 404, ERROR_CODES.NOT_FOUND);
  if (error) throw error;

  const [listing] = await mapListings([data]);
  return listing;
};

const createListing = async (user, payload) => {
  if (![USER_ROLES.FARMER, USER_ROLES.RESELLER].includes(user.role)) {
    throw new AppError('Only sellers can create listings', 403, ERROR_CODES.FORBIDDEN);
  }

  const { profile: sellerProfile, sellerType } = await getSellerProfileForUser(user);
  const now = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from('listings')
    .insert({
      farmer_id: sellerType === 'farmer' ? sellerProfile.id : null,
      reseller_id: sellerType === 'reseller' ? sellerProfile.id : null,
      crop_name_fallback: payload.cropName,
      quantity: payload.quantity,
      quantity_unit: payload.quantityUnit || 'kg',
      price_per_unit: payload.pricePerUnit,
      currency: payload.currency || 'XAF',
      status: payload.status || 'active',
      grade: payload.grade || null,
      delivery_window: payload.deliveryWindow || null,
      summary: payload.summary || null,
      description: payload.description || null,
      location_name: payload.locationName || null,
      specs: payload.specs || {},
      is_export_ready: Boolean(payload.exportReady),
      published_at: payload.status === 'draft' ? null : now
    })
    .select()
    .single();
  if (error) throw error;

  await replaceListingImages(data.id, payload.images || []);
  return getListingById(data.id);
};

const ensureListingOwner = async (listingId, userId) => {
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('id, role')
    .eq('id', userId)
    .single();
  if (userError) throw userError;

  const { profile: sellerProfile, sellerType } = await getSellerProfileForUser(user);
  const { data, error } = await supabaseAdmin
    .from('listings')
    .select('*')
    .eq('id', listingId)
    .eq(sellerType === 'reseller' ? 'reseller_id' : 'farmer_id', sellerProfile.id)
    .single();

  if (error && isNotFound(error)) throw new AppError('Listing not found for this farmer', 404, ERROR_CODES.NOT_FOUND);
  if (error) throw error;
  return data;
};

const replaceListingImages = async (listingId, images) => {
  await supabaseAdmin.from('listing_images').delete().eq('listing_id', listingId);
  if (!images.length) return;

  const rows = images.map((image, index) => ({
    listing_id: listingId,
    url: image.url,
    is_primary: index === 0,
    display_order: index
  }));

  const { error } = await supabaseAdmin.from('listing_images').insert(rows);
  if (error) throw error;
};

const updateListing = async (user, listingId, payload) => {
  await ensureListingOwner(listingId, user.id);

  const updates = {};
  if (payload.cropName !== undefined) updates.crop_name_fallback = payload.cropName;
  if (payload.quantity !== undefined) updates.quantity = payload.quantity;
  if (payload.quantityUnit !== undefined) updates.quantity_unit = payload.quantityUnit;
  if (payload.pricePerUnit !== undefined) updates.price_per_unit = payload.pricePerUnit;
  if (payload.currency !== undefined) updates.currency = payload.currency;
  if (payload.status !== undefined) {
    updates.status = payload.status;
    updates.published_at = payload.status === 'active' ? new Date().toISOString() : null;
  }
  if (payload.grade !== undefined) updates.grade = payload.grade || null;
  if (payload.deliveryWindow !== undefined) updates.delivery_window = payload.deliveryWindow || null;
  if (payload.summary !== undefined) updates.summary = payload.summary || null;
  if (payload.description !== undefined) updates.description = payload.description || null;
  if (payload.locationName !== undefined) updates.location_name = payload.locationName || null;
  if (payload.specs !== undefined) updates.specs = payload.specs || {};
  if (payload.exportReady !== undefined) updates.is_export_ready = Boolean(payload.exportReady);

  if (Object.keys(updates).length) {
    const { error } = await supabaseAdmin.from('listings').update(updates).eq('id', listingId);
    if (error) throw error;
  }

  if (Array.isArray(payload.images)) {
    await replaceListingImages(listingId, payload.images);
  }

  return getListingById(listingId);
};

const deleteListing = async (user, listingId) => {
  await ensureListingOwner(listingId, user.id);
  const { error } = await supabaseAdmin
    .from('listings')
    .update({ status: 'archived' })
    .eq('id', listingId);
  if (error) throw error;
  return { id: listingId, status: 'archived' };
};

module.exports = {
  listPublicListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getFarmerProfileForUser,
  getResellerProfileForUser,
  getSellerProfileForUser,
  getFarmerProfilesByIds,
  getResellerProfilesByIds,
  mapListings
};
