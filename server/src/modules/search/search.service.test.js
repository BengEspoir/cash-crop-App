jest.mock('../listings/listings.service', () => ({
  listPublicListings: jest.fn()
}));
jest.mock('./search.providers', () => ({
  interpretQuery: jest.fn(),
  classifyImage: jest.fn(),
  transcribeAudio: jest.fn()
}));

const listingsService = require('../listings/listings.service');
const providers = require('./search.providers');
const searchService = require('./search.service');

describe('marketplace search service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    listingsService.listPublicListings.mockResolvedValue({
      items: [{ id: 'listing-1', crop: 'Cocoa' }],
      count: 1
    });
    providers.interpretQuery.mockResolvedValue({ filters: null, provider: null });
  });

  test('returns only listing records supplied by the marketplace query', async () => {
    providers.interpretQuery.mockResolvedValue({
      filters: { crop: 'Cocoa', verifiedOnly: true },
      provider: 'openrouter'
    });

    const result = await searchService.searchWithAI('verified cocoa');

    expect(listingsService.listPublicListings).toHaveBeenCalledWith(
      expect.objectContaining({ crop: 'Cocoa', verifiedOnly: true })
    );
    expect(result.items).toEqual([{ id: 'listing-1', crop: 'Cocoa' }]);
    expect(result.provider).toBe('openrouter');
  });

  test('uses a user-confirmed image crop without calling the vision provider', async () => {
    const result = await searchService.searchWithImage({
      file: null,
      productOverride: 'Plantain'
    });

    expect(providers.classifyImage).not.toHaveBeenCalled();
    expect(listingsService.listPublicListings).toHaveBeenCalledWith(
      expect.objectContaining({ crop: 'Plantain' })
    );
    expect(result.classification.confidence).toBe('user-confirmed');
  });
});
