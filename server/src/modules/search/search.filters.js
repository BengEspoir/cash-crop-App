const PRODUCTS = [
  'Cocoa', 'Coffee', 'Maize', 'Plantain', 'Palm Oil', 'Rubber', 'Cassava',
  'Banana', 'Penja Pepper', 'Pepper', 'Rice', 'Groundnut', 'Beans',
  'Soybean', 'Yam', 'Vegetables', 'Honey'
];

const LOCATIONS = [
  'Adamawa', 'Bafoussam', 'Bamenda', 'Bertoua', 'Buea', 'Centre',
  'Douala', 'East', 'Ebolowa', 'Far North', 'Kumba', 'Limbe', 'Littoral',
  'North West', 'North', 'Sangmelima', 'Sangmélima', 'South West', 'South',
  'West', 'Yaounde', 'Yaoundé'
];

const cleanText = value => String(value || '').trim();
const normalize = value => cleanText(value).toLowerCase();
const escapePattern = value => value.replace(/[.*+?^$()|[\]\\]/g, '\\$&');
const findMention = (query, values) => values.find(value => {
  const pattern = escapePattern(normalize(value)).replace(/\s+/g, '\\s+');
  return new RegExp(`\\b${pattern}\\b`, 'i').test(normalize(query));
});

const parseNumber = value => {
  const parsed = Number(String(value || '').replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseNaturalLanguage = query => {
  const text = cleanText(query);
  const lower = normalize(text);
  const quantityMatch = lower.match(/(?:at least|minimum|min\.?|over|more than)?\s*([\d,.]+)\s*(metric tons?|tonnes?|tons?|mt|kilograms?|kgs?|kg|bags?|bunches?)/i);
  const priceMatch = lower.match(/(?:under|below|less than|max(?:imum)?|up to)\s*(?:xaf|fcfa)?\s*([\d,.]+)/i);
  const unit = quantityMatch?.[2]?.toLowerCase();
  let quantityUnit;
  if (unit) {
    if (/metric|tonne|tons?|mt/.test(unit)) quantityUnit = 'mt';
    else if (/kg|kilogram/.test(unit)) quantityUnit = 'kg';
    else if (/bag/.test(unit)) quantityUnit = 'bag';
    else if (/bunch/.test(unit)) quantityUnit = 'bunch';
  }

  return {
    query: text,
    crop: findMention(text, PRODUCTS),
    region: findMention(text, LOCATIONS),
    sellerType: /\b(reseller|aggregator|trader)\b/.test(lower)
      ? 'reseller'
      : /\b(farmers?|producers?|farms?)\b/.test(lower) ? 'farmer' : undefined,
    verifiedOnly: /\bverified\b/.test(lower),
    exportReady: /\bexport(?:[- ]ready)?\b/.test(lower),
    availability: /\b(available|in stock|ready now|ready for inspection)\b/.test(lower),
    minQuantity: quantityMatch ? parseNumber(quantityMatch[1]) : undefined,
    quantityUnit,
    maxPrice: priceMatch ? parseNumber(priceMatch[1]) : undefined,
    sort: /\b(cheapest|lowest price|price low)\b/.test(lower)
      ? 'price-asc'
      : /\b(highest price|price high)\b/.test(lower) ? 'price-desc' : 'newest'
  };
};

const parseJsonObject = value => {
  const source = cleanText(value).replace(/^\x60\x60\x60(?:json)?\s*/i, '').replace(/\s*\x60\x60\x60$/i, '');
  const start = source.indexOf('{');
  const end = source.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(source.slice(start, end + 1));
  } catch {
    return null;
  }
};

const sanitiseFilters = (candidate = {}, fallbackQuery = '') => ({
  query: cleanText(candidate.query || fallbackQuery).slice(0, 1000),
  crop: cleanText(candidate.crop).slice(0, 80) || undefined,
  region: cleanText(candidate.region).slice(0, 80) || undefined,
  sellerType: ['farmer', 'reseller'].includes(candidate.sellerType)
    ? candidate.sellerType
    : undefined,
  verifiedOnly: Boolean(candidate.verifiedOnly),
  exportReady: Boolean(candidate.exportReady),
  availability: Boolean(candidate.availability),
  minQuantity: parseNumber(candidate.minQuantity),
  quantityUnit: ['kg', 'mt', 'bag', 'bunch'].includes(candidate.quantityUnit)
    ? candidate.quantityUnit
    : undefined,
  maxPrice: parseNumber(candidate.maxPrice),
  sort: ['newest', 'price-asc', 'price-desc'].includes(candidate.sort)
    ? candidate.sort
    : 'newest',
  limit: 100
});

module.exports = {
  PRODUCTS,
  cleanText,
  parseJsonObject,
  parseNaturalLanguage,
  sanitiseFilters
};
