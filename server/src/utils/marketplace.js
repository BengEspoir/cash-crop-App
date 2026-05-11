const { USER_ROLES, USER_STATUS } = require('../config/constants');

const FARMER_VERIFICATION_STATUS = {
  NOT_STARTED: 'not_started',
  PENDING_REVIEW: 'pending_review',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
};

const isBuyerRole = (role) => (
  role === USER_ROLES.LOCAL_BUYER ||
  role === USER_ROLES.INTERNATIONAL_BUYER
);

const isSellerRole = (role) => (
  role === USER_ROLES.FARMER ||
  role === USER_ROLES.RESELLER
);

const getSellerProfileTable = (role) => {
  if (role === USER_ROLES.RESELLER) return 'reseller_profiles';
  return 'farmer_profiles';
};

const normalizeVerificationStatus = (profile = {}) => {
  if (profile.identity_verification_status) {
    return profile.identity_verification_status;
  }

  if (profile.verified_at) {
    return FARMER_VERIFICATION_STATUS.VERIFIED;
  }

  if (profile.rejection_reason) {
    return FARMER_VERIFICATION_STATUS.REJECTED;
  }

  if (profile.verification_submitted_at) {
    return FARMER_VERIFICATION_STATUS.PENDING_REVIEW;
  }

  return FARMER_VERIFICATION_STATUS.NOT_STARTED;
};

const isVerifiedFarmerProfile = (profile = {}, user = {}) => (
  normalizeVerificationStatus(profile) === FARMER_VERIFICATION_STATUS.VERIFIED &&
  (!user.status || user.status === USER_STATUS.ACTIVE)
);

const isVerifiedSellerProfile = isVerifiedFarmerProfile;

const formatNumber = (value) => {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric)) return '0';
  return Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(2);
};

const formatCurrency = (value, currency = 'XAF') => {
  const numeric = Number(value || 0);
  return `${currency} ${numeric.toLocaleString('en-CM', { maximumFractionDigits: 0 })}`;
};

const mapUserName = (user = {}) => (
  [user.first_name, user.last_name].filter(Boolean).join(' ') ||
  user.email ||
  user.phone ||
  'Unknown user'
);

const mapFarmerProfile = (profile = {}, user = {}, extra = {}) => {
  const verificationStatus = normalizeVerificationStatus(profile);
  const displayName = profile.farm_name || mapUserName(user);

  return {
    id: profile.id,
    userId: profile.user_id,
    name: displayName,
    contactName: mapUserName(user),
    initials: displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase(),
    email: user.email || null,
    phone: user.phone || null,
    location: [user.city, user.region || user.country].filter(Boolean).join(', ') || 'Location pending',
    city: user.city || null,
    region: user.region || null,
    country: user.country || 'Cameroon',
    farmName: profile.farm_name || null,
    cooperativeName: profile.cooperative_name || null,
    bio: profile.bio || '',
    primaryCrop: profile.primary_crop || null,
    harvestVolume: profile.harvest_volume || null,
    cropsGrown: profile.crops_grown || [],
    verificationStatus,
    verified: verificationStatus === FARMER_VERIFICATION_STATUS.VERIFIED,
    verifiedAt: profile.verified_at || null,
    rejectionReason: profile.rejection_reason || null,
    joinedAt: user.created_at || profile.created_at,
    rating: Number(profile.average_rating || 0),
    reviews: Number(profile.total_reviews || 0),
    ...extra
  };
};

const mapResellerProfile = (profile = {}, user = {}, extra = {}) => {
  const verificationStatus = normalizeVerificationStatus(profile);
  const displayName = profile.business_name || profile.company_name || mapUserName(user);

  return {
    id: profile.id,
    userId: profile.user_id,
    sellerType: 'reseller',
    name: displayName,
    contactName: mapUserName(user),
    initials: displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase(),
    email: user.email || null,
    phone: user.phone || null,
    location: [user.city, user.region || user.country].filter(Boolean).join(', ') || 'Location pending',
    city: user.city || null,
    region: user.region || null,
    country: user.country || 'Cameroon',
    businessName: profile.business_name || profile.company_name || null,
    about: profile.about || profile.bio || '',
    bio: profile.about || profile.bio || '',
    primaryCrop: profile.primary_crop || null,
    cropsSold: profile.crops_sold || [],
    verificationStatus,
    verified: verificationStatus === FARMER_VERIFICATION_STATUS.VERIFIED,
    verifiedAt: profile.verified_at || null,
    rejectionReason: profile.rejection_reason || null,
    joinedAt: user.created_at || profile.created_at,
    rating: Number(profile.average_rating || 0),
    reviews: Number(profile.total_reviews || 0),
    ...extra
  };
};

const mapSellerProfile = (profile = {}, user = {}, extra = {}) => {
  if (user.role === USER_ROLES.RESELLER || profile.business_name || profile.crops_sold) {
    return mapResellerProfile(profile, user, { sellerType: 'reseller', ...extra });
  }

  return {
    ...mapFarmerProfile(profile, user, extra),
    sellerType: 'farmer'
  };
};

const mapListing = (row = {}, options = {}) => {
  const imageByListing = options.imageByListing || {};
  const farmer = options.farmer || null;
  const seller = options.seller || farmer || null;
  const crop = row.crop_name_fallback || row.crop_name || row.crop?.name || 'Crop listing';
  const quantityUnit = row.quantity_unit || 'kg';
  const currency = row.currency || 'XAF';

  return {
    id: row.id,
    farmerId: row.farmer_id,
    resellerId: row.reseller_id || null,
    sellerId: row.reseller_id || row.farmer_id,
    sellerType: row.reseller_id ? 'reseller' : 'farmer',
    crop,
    cropName: crop,
    quantity: `${formatNumber(row.quantity)} ${quantityUnit}`,
    quantityValue: Number(row.quantity || 0),
    quantityUnit,
    quantityLabel: `${formatNumber(row.quantity)} ${quantityUnit} available`,
    price: `${currency} ${formatNumber(row.price_per_unit)} / ${quantityUnit}`,
    priceValue: Number(row.price_per_unit || 0),
    pricePerUnit: Number(row.price_per_unit || 0),
    currency,
    location: row.location_name || 'Location pending',
    status: row.status || 'draft',
    grade: row.grade || null,
    deliveryWindow: row.delivery_window || 'Ready for inspection',
    summary: row.summary || row.description || 'No listing summary yet.',
    description: row.description || '',
    specs: row.specs || {},
    exportReady: Boolean(row.is_export_ready),
    listingVerified: Boolean(row.is_verified),
    viewCount: Number(row.view_count ?? 0),
    inquiryCount: Number(row.inquiry_count ?? 0),
    imageSrc: imageByListing[row.id] || row.imageSrc || null,
    images: options.images || [],
    farmer,
    seller,
    sellerVerificationStatus: seller?.verificationStatus || FARMER_VERIFICATION_STATUS.NOT_STARTED,
    farmerVerificationStatus: seller?.verificationStatus || FARMER_VERIFICATION_STATUS.NOT_STARTED,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at
  };
};

const mapQuote = (row = {}, options = {}) => ({
  id: row.id,
  listingId: row.listing_id,
  farmerId: row.farmer_id,
  resellerId: row.reseller_id || null,
  sellerId: row.reseller_id || row.farmer_id,
  sellerType: row.reseller_id ? 'reseller' : 'farmer',
  buyerId: row.buyer_id,
  crop: options.listing?.crop || options.listing?.crop_name_fallback || 'Quote request',
  listing: options.listing || null,
  farmer: options.farmer || null,
  seller: options.seller || options.farmer || null,
  buyer: options.buyer || null,
  message: row.message,
  requestedQty: row.requested_qty !== null && row.requested_qty !== undefined ? Number(row.requested_qty) : null,
  requestedPrice: row.requested_price !== null && row.requested_price !== undefined ? Number(row.requested_price) : null,
  currency: row.currency || 'XAF',
  status: row.status || 'pending',
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const mapMessage = (row = {}, sender = null, currentUserId = null) => ({
  id: row.id,
  conversationId: row.conversation_id,
  senderId: row.sender_id,
  sender: sender ? mapUserName(sender) : 'Unknown user',
  senderRole: sender?.role || 'user',
  mine: row.sender_id === currentUserId,
  content: row.content,
  isRead: Boolean(row.is_read),
  sentAt: row.created_at,
  createdAt: row.created_at
});

const mapOrder = (row = {}, options = {}) => ({
  id: row.order_number || row.id,
  rawId: row.id,
  orderNumber: row.order_number,
  listingId: row.listing_id,
  buyerId: row.buyer_id,
  farmerId: row.farmer_id,
  resellerId: row.reseller_id || null,
  sellerId: row.reseller_id || row.farmer_id,
  sellerType: row.reseller_id ? 'reseller' : 'farmer',
  crop: options.listing?.crop || options.listing?.crop_name_fallback || 'Crop order',
  buyer: options.buyer || null,
  farmer: options.farmer || null,
  seller: options.seller || options.farmer || null,
  quantity: `${formatNumber(row.quantity)} ${row.quantity_unit || 'kg'}`,
  amount: Number(row.total_amount || 0),
  amountLabel: formatCurrency(row.total_amount, row.currency || 'XAF'),
  currency: row.currency || 'XAF',
  status: row.status || 'pending_payment',
  notes: row.notes || '',
  timeline: row.timeline || [],
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const mapPayment = (row = {}) => ({
  id: row.id,
  orderId: row.order_id,
  payerId: row.payer_id,
  payeeId: row.payee_id,
  amount: Number(row.amount || 0),
  amountLabel: formatCurrency(row.amount, row.currency || 'XAF'),
  currency: row.currency || 'XAF',
  status: row.status || 'pending',
  channel: row.channel || 'internal_ledger',
  transactionRef: row.transaction_ref || null,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

module.exports = {
  FARMER_VERIFICATION_STATUS,
  isBuyerRole,
  isSellerRole,
  getSellerProfileTable,
  normalizeVerificationStatus,
  isVerifiedFarmerProfile,
  isVerifiedSellerProfile,
  formatNumber,
  formatCurrency,
  mapUserName,
  mapFarmerProfile,
  mapResellerProfile,
  mapSellerProfile,
  mapListing,
  mapQuote,
  mapMessage,
  mapOrder,
  mapPayment
};
