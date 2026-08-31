const listingsService = require('../listings/listings.service');
const {
  cleanText,
  parseNaturalLanguage,
  sanitiseFilters
} = require('./search.filters');
const {
  interpretQuery,
  classifyImage,
  transcribeAudio
} = require('./search.providers');

const buildInterpretation = filters => {
  const details = [];
  if (filters.crop) details.push(filters.crop);
  if (filters.region) details.push(`in ${filters.region}`);
  if (filters.sellerType) details.push(`from ${filters.sellerType}s`);
  if (filters.verifiedOnly) details.push('verified suppliers only');
  if (filters.exportReady) details.push('export-ready');
  if (filters.minQuantity) {
    details.push(`at least ${filters.minQuantity} ${filters.quantityUnit || 'units'}`);
  }
  if (filters.maxPrice) {
    details.push(`up to XAF ${filters.maxPrice.toLocaleString('en')}`);
  }
  return details.length ? details.join(', ') : 'all currently published listings';
};

const executeListingSearch = async ({
  mode,
  filters,
  provider = null,
  classification = null
}) => {
  const result = await listingsService.listPublicListings(filters);
  const count = result.items.length;
  return {
    mode,
    items: result.items,
    count,
    filters,
    provider,
    classification,
    interpretation: `Showing ${count} real marketplace ${count === 1 ? 'listing' : 'listings'} matching ${buildInterpretation(filters)}.`,
    suggestions: count ? [] : [
      'Try a broader location or crop name.',
      'Remove quantity, verification, or price limits.',
      'Browse all published listings.'
    ]
  };
};

const searchWithAI = async query => {
  const deterministic = parseNaturalLanguage(query);
  const interpreted = await interpretQuery(query);
  const combined = interpreted.filters
    ? { ...deterministic, ...interpreted.filters, query: cleanText(query) }
    : deterministic;

  return executeListingSearch({
    mode: 'ai',
    filters: sanitiseFilters(combined, query),
    provider: interpreted.provider
  });
};

const searchWithImage = async ({ file, productOverride }) => {
  const override = cleanText(productOverride).slice(0, 80);
  const classification = override
    ? { crop: override, confidence: 'user-confirmed', provider: null }
    : await classifyImage(file);

  return executeListingSearch({
    mode: 'image',
    filters: sanitiseFilters({
      crop: classification.crop,
      query: classification.crop
    }),
    provider: classification.provider,
    classification
  });
};

module.exports = {
  searchWithAI,
  searchWithImage,
  transcribeAudio
};
