const express = require('express');
const crypto = require('crypto');
const env = require('../src/config/env');
const { supabaseAdmin } = require('../src/config/supabase');
const logger = require('../src/utils/logger');
const { normalizeWhatsappPhone } = require('../services/whatsappRelay');

const router = express.Router();

const hasValidSignature = (req) => {
  if (!env.WHATSAPP_APP_SECRET) return true;
  const received = String(req.get('x-hub-signature-256') || '');
  if (!received.startsWith('sha256=') || !req.rawBody) return false;
  const expected = `sha256=${crypto
    .createHmac('sha256', env.WHATSAPP_APP_SECRET)
    .update(req.rawBody)
    .digest('hex')}`;
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return receivedBuffer.length === expectedBuffer.length
    && crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
};

const extractTextMessages = (payload) => {
  if (payload?.object !== 'whatsapp_business_account') return [];
  return (payload.entry || []).flatMap((entry) =>
    (entry.changes || []).flatMap((change) => {
      const value = change?.value || {};
      return (value.messages || [])
        .filter((message) => message?.type === 'text' && message?.text?.body)
        .map((message) => ({
          externalMessageId: message.id,
          contextMessageId: message.context?.id || null,
          from: message.from,
          text: message.text.body.trim(),
        }));
    }));
};

const findRelayThread = async ({ normalizedPhone, contextMessageId }) => {
  if (contextMessageId) {
    const { data, error } = await supabaseAdmin
      .from('whatsapp_relay_threads')
      .select('*')
      .eq('last_outbound_message_id', contextMessageId)
      .maybeSingle();
    if (error) throw error;
    if (data) return data;
  }

  const { data, error } = await supabaseAdmin
    .from('whatsapp_relay_threads')
    .select('*')
    .eq('normalized_phone', normalizedPhone)
    .gte('last_outbound_at', new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)).toISOString())
    .order('last_outbound_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
};

const persistInboundMessage = async (message) => {
  const normalizedPhone = normalizeWhatsappPhone(message.from);
  const relayThread = await findRelayThread({
    normalizedPhone,
    contextMessageId: message.contextMessageId,
  });
  if (!relayThread) {
    logger.warn({ message: 'Ignored unmatched WhatsApp reply', normalizedPhone });
    return;
  }

  const createdAt = new Date().toISOString();
  const { error } = await supabaseAdmin.from('messages').insert({
    conversation_id: relayThread.conversation_id,
    sender_id: relayThread.farmer_user_id,
    content: message.text,
    delivery_channel: 'whatsapp',
    external_message_id: message.externalMessageId,
    external_sender_phone: normalizedPhone,
    created_at: createdAt,
  });
  if (error?.code === '23505') return;
  if (error) throw error;

  await Promise.all([
    supabaseAdmin
      .from('conversations')
      .update({ last_message_at: createdAt })
      .eq('id', relayThread.conversation_id),
    supabaseAdmin
      .from('whatsapp_relay_threads')
      .update({ last_inbound_at: createdAt, updated_at: createdAt })
      .eq('conversation_id', relayThread.conversation_id),
  ]);
};

const processWhatsappWebhook = async (payload) => {
  const messages = extractTextMessages(payload);
  await Promise.all(messages.map(persistInboundMessage));
};

router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && env.WHATSAPP_VERIFY_TOKEN && token === env.WHATSAPP_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

router.post('/', (req, res) => {
  if (!hasValidSignature(req)) return res.sendStatus(401);
  res.sendStatus(200);
  setImmediate(() => {
    processWhatsappWebhook(req.body).catch((error) => {
      logger.error({ message: 'WhatsApp webhook processing failed', error: error.message });
    });
  });
});

module.exports = router;
module.exports.extractTextMessages = extractTextMessages;
module.exports.processWhatsappWebhook = processWhatsappWebhook;
module.exports.hasValidSignature = hasValidSignature;
