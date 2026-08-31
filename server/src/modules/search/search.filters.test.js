const {
  parseNaturalLanguage,
  sanitiseFilters
} = require('./search.filters');

describe('marketplace search filters', () => {
  test('extracts crop, location, quantity, seller, and trust constraints', () => {
    expect(parseNaturalLanguage(
      'Find verified cocoa farmers in Kumba with at least 2 metric tons for export'
    )).toEqual(expect.objectContaining({
      crop: 'Cocoa',
      region: 'Kumba',
      sellerType: 'farmer',
      verifiedOnly: true,
      exportReady: true,
      minQuantity: 2,
      quantityUnit: 'mt'
    }));
  });

  test('drops unsupported provider values before querying listings', () => {
    expect(sanitiseFilters({
      crop: 'Coffee',
      sellerType: 'broker',
      quantityUnit: 'truck',
      sort: 'random'
    })).toEqual(expect.objectContaining({
      crop: 'Coffee',
      sellerType: undefined,
      quantityUnit: undefined,
      sort: 'newest',
      limit: 100
    }));
  });
});
