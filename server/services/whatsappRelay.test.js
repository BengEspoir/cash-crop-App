const mockUpsert = jest.fn();

jest.mock('../src/config/env', () => ({
  WHATSAPP_RELAY_ENABLED: true,
  WHATSAPP_ACCESS_TOKEN: 'test-access-token',
  WHATSAPP_PHONE_NUMBER_ID: '123456789',
  WHATSAPP_API_VERSION: 'v23.0',
  WHATSAPP_INQUIRY_TEMPLATE_NAME: '',
  WHATSAPP_TEMPLATE_LANGUAGE_CODE: 'en_US',
  WHATSAPP_REQUEST_TIMEOUT_MS: 5000,
}));

jest.mock('../src/config/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({ upsert: mockUpsert })),
  },
}));

const env = require('../src/config/env');
const {
  normalizeWhatsappPhone,
  formatBuyerRelayMessage,
  forwardBuyerMessageToWhatsApp,
} = require('./whatsappRelay');

describe('WhatsApp relay service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    env.WHATSAPP_RELAY_ENABLED = true;
    mockUpsert.mockResolvedValue({ error: null });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ messages: [{ id: 'wamid.test' }] }),
    });
  });

  afterAll(() => {
    delete global.fetch;
  });

  test.each([
    ['+237 6 99 12 34 56', '237699123456'],
    ['699123456', '237699123456'],
    ['0699123456', '237699123456'],
    ['00237699123456', '237699123456'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(normalizeWhatsappPhone(input)).toBe(expected);
  });

  test('formats the privacy relay copy with an AgriculNet thread reference', () => {
    expect(formatBuyerRelayMessage({
      buyerName: 'Amina Buyer',
      cropName: 'Cocoa',
      messageText: 'Is inspection possible?',
      threadId: 'thread-1',
    })).toContain('Buyer cannot see your phone number');
  });

  test('sends through Meta and stores the outbound message binding', async () => {
    await expect(forwardBuyerMessageToWhatsApp({
      farmerPhone: '699123456',
      farmerUserId: 'farmer-user-id',
      buyerName: 'Amina Buyer',
      cropName: 'Cocoa',
      messageText: 'Is inspection possible?',
      threadId: 'thread-1',
    })).resolves.toEqual({ delivered: true, externalMessageId: 'wamid.test' });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://graph.facebook.com/v23.0/123456789/messages',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        conversation_id: 'thread-1',
        farmer_user_id: 'farmer-user-id',
        normalized_phone: '237699123456',
        last_outbound_message_id: 'wamid.test',
      }),
      { onConflict: 'conversation_id' },
    );
  });

  test('skips Meta entirely while the feature flag is disabled', async () => {
    env.WHATSAPP_RELAY_ENABLED = false;
    await expect(forwardBuyerMessageToWhatsApp({})).resolves.toEqual({
      delivered: false,
      reason: 'relay_disabled',
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
