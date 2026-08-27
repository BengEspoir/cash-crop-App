const env = require('../src/config/env');
const { supabaseAdmin } = require('../src/config/supabase');

const normalizeWhatsappPhone = (value, defaultCountryCode = '237') => {
  let digits = String(value || '').trim().replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = `${defaultCountryCode}${digits.slice(1)}`;
  if (digits.length === 9 && digits.startsWith('6')) digits = `${defaultCountryCode}${digits}`;
  if (digits.length < 8 || digits.length > 15) {
    throw new Error('A valid international WhatsApp phone number is required');
  }
  return digits;
};

const formatBuyerRelayMessage = ({ buyerName, cropName, messageText, threadId }) => [
  '📩 New Buyer Inquiry on AgriculNet',
  `Buyer: ${String(buyerName || 'AgriculNet buyer').trim()}`,
  `Crop: ${String(cropName || 'Crop listing').trim()}`,
  `Message: '${String(messageText || '').trim()}'`,
  '--------------------',
  'Reply directly to this WhatsApp text to respond to the buyer. (Buyer cannot see your phone number).',
  `AgriculNet thread: ${threadId}`,
].join('\n');

const saveRelayBinding = async ({ threadId, farmerUserId, normalizedPhone, externalMessageId }) => {
  if (!farmerUserId) return;
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from('whatsapp_relay_threads')
    .upsert({
      conversation_id: threadId,
      farmer_user_id: farmerUserId,
      normalized_phone: normalizedPhone,
      last_outbound_message_id: externalMessageId || null,
      last_outbound_at: now,
      updated_at: now,
    }, { onConflict: 'conversation_id' });
  if (error) throw error;
};

async function forwardBuyerMessageToWhatsApp({
  farmerPhone,
  farmerUserId,
  buyerName,
  cropName,
  messageText,
  threadId,
}) {
  if (!env.WHATSAPP_RELAY_ENABLED) {
    return { delivered: false, reason: 'relay_disabled' };
  }
  if (!env.WHATSAPP_ACCESS_TOKEN || !env.WHATSAPP_PHONE_NUMBER_ID) {
    return { delivered: false, reason: 'relay_not_configured' };
  }

  const to = normalizeWhatsappPhone(farmerPhone);
  const body = formatBuyerRelayMessage({ buyerName, cropName, messageText, threadId });
  const messagePayload = env.WHATSAPP_INQUIRY_TEMPLATE_NAME
    ? {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'template',
        template: {
          name: env.WHATSAPP_INQUIRY_TEMPLATE_NAME,
          language: { code: env.WHATSAPP_TEMPLATE_LANGUAGE_CODE },
          components: [{
            type: 'body',
            parameters: [
              { type: 'text', text: String(buyerName || 'AgriculNet buyer').trim() },
              { type: 'text', text: String(cropName || 'Crop listing').trim() },
              { type: 'text', text: String(messageText || '').trim() },
              { type: 'text', text: String(threadId) },
            ],
          }],
        },
      }
    : {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { preview_url: false, body },
      };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.WHATSAPP_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://graph.facebook.com/${env.WHATSAPP_API_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messagePayload),
        signal: controller.signal,
      }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data?.error?.message || `WhatsApp Cloud API returned ${response.status}`);
      error.statusCode = response.status;
      throw error;
    }

    const externalMessageId = data?.messages?.[0]?.id || null;
    await saveRelayBinding({
      threadId,
      farmerUserId,
      normalizedPhone: to,
      externalMessageId,
    });
    return { delivered: true, externalMessageId };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  normalizeWhatsappPhone,
  formatBuyerRelayMessage,
  forwardBuyerMessageToWhatsApp,
};
