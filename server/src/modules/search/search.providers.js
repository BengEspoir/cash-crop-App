const env = require('../../config/env');
const AppError = require('../../utils/AppError');
const { ERROR_CODES } = require('../../config/constants');
const {
  getConfiguredProviders,
  requestProviderReply
} = require('../chat/chat.providers');
const { cleanText, parseJsonObject } = require('./search.filters');

const runProvider = async ({ providers, messages, systemPrompt }) => {
  for (const provider of providers) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.AI_PROVIDER_TIMEOUT_MS);
    try {
      const reply = await requestProviderReply({
        provider,
        messages,
        systemPrompt,
        signal: controller.signal
      });
      return { reply, provider: provider.name };
    } catch {
      // Fail over without exposing credentials or upstream responses.
    } finally {
      clearTimeout(timeout);
    }
  }
  return null;
};

const interpretQuery = async query => {
  const response = await runProvider({
    providers: getConfiguredProviders(),
    systemPrompt: [
      'Convert an agricultural marketplace query into JSON filters only.',
      'Allowed keys: crop, region, sellerType, verifiedOnly, exportReady, availability, minQuantity, quantityUnit, maxPrice, sort.',
      'sellerType is farmer or reseller. quantityUnit is kg, mt, bag, or bunch.',
      'Never invent listings, sellers, prices, availability, or facts.'
    ].join(' '),
    messages: [{ role: 'user', content: cleanText(query) }]
  });

  return {
    filters: parseJsonObject(response?.reply),
    provider: response?.provider || null
  };
};

const classifyImage = async file => {
  if (!env.OPENROUTER_API_KEY) {
    throw new AppError(
      'Image recognition is not configured. Choose the crop manually instead.',
      503,
      ERROR_CODES.AI_NOT_CONFIGURED
    );
  }

  const provider = {
    name: 'openrouter',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    apiKey: env.OPENROUTER_API_KEY,
    modelFields: { model: env.AI_VISION_MODEL },
    maxTokensField: 'max_tokens',
    headers: {
      ...(env.CLIENT_URL ? { 'HTTP-Referer': env.CLIENT_URL } : {}),
      'X-Title': 'AgriculNet Visual Search'
    }
  };
  const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  const response = await runProvider({
    providers: [provider],
    systemPrompt: 'Identify the agricultural product. Return JSON only: {crop:name,confidence:low|medium|high}. Never describe a listing.',
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: 'What agricultural crop or product is most likely shown?' },
        { type: 'image_url', image_url: { url: dataUrl } }
      ]
    }]
  });
  const parsed = parseJsonObject(response?.reply);
  if (!parsed?.crop) {
    throw new AppError(
      'The crop could not be identified. Choose it manually.',
      422,
      ERROR_CODES.AI_PROVIDER_ERROR
    );
  }

  return {
    crop: cleanText(parsed.crop).slice(0, 80),
    confidence: ['low', 'medium', 'high'].includes(parsed.confidence)
      ? parsed.confidence
      : 'low',
    provider: response.provider
  };
};

const transcribeAudio = async file => {
  if (!env.GROQ_API_KEY) {
    throw new AppError('Voice transcription is not configured.', 503, ERROR_CODES.AI_NOT_CONFIGURED);
  }

  const form = new FormData();
  form.append(
    'file',
    new Blob([file.buffer], { type: file.mimetype }),
    file.originalname || 'search.webm'
  );
  form.append('model', env.AI_TRANSCRIPTION_MODEL);
  form.append('response_format', 'json');
  if (env.AI_TRANSCRIPTION_LANGUAGE) {
    form.append('language', env.AI_TRANSCRIPTION_LANGUAGE);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.AI_REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.GROQ_API_KEY}` },
      body: form,
      signal: controller.signal
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !cleanText(payload.text)) {
      throw new AppError(
        'Voice transcription failed. Type your search instead.',
        502,
        ERROR_CODES.AI_PROVIDER_ERROR
      );
    }
    return cleanText(payload.text);
  } catch (error) {
    if (error instanceof AppError) throw error;
    const isTimeout = error?.name === 'AbortError';
    throw new AppError(
      isTimeout ? 'Voice transcription timed out.' : 'Voice transcription is temporarily unavailable.',
      isTimeout ? 504 : 502,
      isTimeout ? ERROR_CODES.AI_REQUEST_TIMEOUT : ERROR_CODES.AI_PROVIDER_ERROR
    );
  } finally {
    clearTimeout(timeout);
  }
};

module.exports = {
  interpretQuery,
  classifyImage,
  transcribeAudio
};
