jest.mock('../src/config/env', () => ({
  WHATSAPP_VERIFY_TOKEN: 'verify-me',
  WHATSAPP_APP_SECRET: '',
  WHATSAPP_RELAY_ENABLED: false,
}));

jest.mock('../src/config/supabase', () => ({
  supabaseAdmin: { from: jest.fn() },
}));

jest.mock('../src/utils/logger', () => ({ error: jest.fn(), warn: jest.fn() }));

const express = require('express');
const request = require('supertest');
const router = require('./whatsappWebhook');
const { extractTextMessages } = require('./whatsappWebhook');

describe('WhatsApp webhook', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/webhook/whatsapp', router);

  test('returns the Meta verification challenge for the configured token', async () => {
    const response = await request(app)
      .get('/api/webhook/whatsapp')
      .query({ 'hub.mode': 'subscribe', 'hub.verify_token': 'verify-me', 'hub.challenge': 'challenge-123' });
    expect(response.status).toBe(200);
    expect(response.text).toBe('challenge-123');
  });

  test('rejects an invalid verification token', async () => {
    await request(app)
      .get('/api/webhook/whatsapp')
      .query({ 'hub.mode': 'subscribe', 'hub.verify_token': 'wrong', 'hub.challenge': 'challenge-123' })
      .expect(403);
  });

  test('extracts text, sender, message id, and reply context from Meta events', () => {
    expect(extractTextMessages({
      object: 'whatsapp_business_account',
      entry: [{ changes: [{ value: { messages: [{
        id: 'wamid.inbound',
        from: '237699123456',
        type: 'text',
        text: { body: 'Yes, inspection is possible.' },
        context: { id: 'wamid.outbound' },
      }] } }] }],
    })).toEqual([{
      externalMessageId: 'wamid.inbound',
      contextMessageId: 'wamid.outbound',
      from: '237699123456',
      text: 'Yes, inspection is possible.',
    }]);
  });

  test('acknowledges valid non-message events immediately', async () => {
    await request(app)
      .post('/api/webhook/whatsapp')
      .send({ object: 'whatsapp_business_account', entry: [] })
      .expect(200);
  });
});
