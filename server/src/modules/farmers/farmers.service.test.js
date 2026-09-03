const mockLimit = jest.fn();
const mockOrder = jest.fn(() => ({ limit: mockLimit }));
const mockSelect = jest.fn(() => ({ order: mockOrder }));
const mockFrom = jest.fn((table) => {
  if (table === 'users') {
    return {
      select: jest.fn(() => ({
        in: jest.fn().mockResolvedValue({
          data: [
            { id: 'u-1', first_name: 'Paul', last_name: 'Biya', role: 'farmer', status: 'active', region: 'South West' },
            { id: 'u-2', first_name: 'Marie', last_name: 'Claire', role: 'reseller', status: 'active', region: 'Littoral' },
            { id: 'u-3', first_name: 'Suspended', last_name: 'User', role: 'farmer', status: 'suspended', region: 'Centre' }
          ],
          error: null
        })
      }))
    };
  }
  if (table === 'farmer_profiles') {
    return {
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          limit: jest.fn().mockResolvedValue({
            data: [
              { id: 'fp-1', user_id: 'u-1', primary_crop: 'Cocoa', crops_grown: ['Cocoa', 'Coffee'], identity_verification_status: 'verified', rating: 4.8 },
              { id: 'fp-3', user_id: 'u-3', primary_crop: 'Rubber', crops_grown: ['Rubber'], identity_verification_status: 'verified', rating: 3.5 }
            ],
            error: null
          })
        })),
        eq: jest.fn(() => ({
          limit: jest.fn().mockResolvedValue({
            data: [
              { id: 'fp-1', user_id: 'u-1', primary_crop: 'Cocoa', crops_grown: ['Cocoa', 'Coffee'], identity_verification_status: 'verified', rating: 4.8 }
            ],
            error: null
          })
        }))
      }))
    };
  }
  if (table === 'reseller_profiles') {
    return {
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          limit: jest.fn().mockResolvedValue({
            data: [
              { id: 'rp-2', user_id: 'u-2', business_name: 'AgriResell SARL', primary_crop: 'Coffee', crops_sold: ['Coffee'], identity_verification_status: 'verified', rating: 4.5 }
            ],
            error: null
          })
        })),
        eq: jest.fn(() => ({
          limit: jest.fn().mockResolvedValue({
            data: [
              { id: 'rp-2', user_id: 'u-2', business_name: 'AgriResell SARL', primary_crop: 'Coffee', crops_sold: ['Coffee'], identity_verification_status: 'verified', rating: 4.5 }
            ],
            error: null
          })
        }))
      }))
    };
  }
  return { select: mockSelect };
});

jest.mock('../../config/supabase', () => ({
  supabaseAdmin: {
    from: mockFrom
  }
}));

const service = require('./farmers.service');

describe('farmers service sellerType filtering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('filters for only farmers when sellerType is farmer', async () => {
    const result = await service.listFarmers({ sellerType: 'farmer' });
    expect(result.items.length).toBe(1);
    expect(result.items[0].sellerType).toBe('farmer');
    expect(result.items[0].userId).toBe('u-1');
    // reseller_profiles table should not even be queried
    expect(mockFrom).not.toHaveBeenCalledWith('reseller_profiles');
    expect(mockFrom).toHaveBeenCalledWith('farmer_profiles');
  });

  test('filters for only resellers when sellerType is reseller', async () => {
    const result = await service.listFarmers({ sellerType: 'reseller' });
    expect(result.items.length).toBe(1);
    expect(result.items[0].sellerType).toBe('reseller');
    expect(result.items[0].userId).toBe('u-2');
    // farmer_profiles table should not even be queried
    expect(mockFrom).not.toHaveBeenCalledWith('farmer_profiles');
    expect(mockFrom).toHaveBeenCalledWith('reseller_profiles');
  });

  test('includes both farmers and resellers when sellerType is empty or all', async () => {
    const result = await service.listFarmers({ sellerType: '' });
    expect(result.items.length).toBe(2);
    const types = result.items.map((i) => i.sellerType);
    expect(types).toContain('farmer');
    expect(types).toContain('reseller');
  });

  test('excludes suspended and deactivated accounts from results', async () => {
    const result = await service.listFarmers({ sellerType: 'farmer' });
    const userIds = result.items.map((i) => i.userId);
    expect(userIds).not.toContain('u-3');
  });

  test('returns empty results safely for an invalid sellerType', async () => {
    const result = await service.listFarmers({ sellerType: 'invalid_type' });
    expect(result.items).toEqual([]);
    expect(result.count).toBe(0);
  });

  test('filters by region correctly', async () => {
    const result = await service.listFarmers({ region: 'South West' });
    expect(result.items.length).toBe(1);
    expect(result.items[0].userId).toBe('u-1');
  });

  test('filters by crop correctly', async () => {
    const result = await service.listFarmers({ crop: 'Cocoa' });
    expect(result.items.length).toBe(1);
    expect(result.items[0].primaryCrop).toBe('Cocoa');
  });
});
