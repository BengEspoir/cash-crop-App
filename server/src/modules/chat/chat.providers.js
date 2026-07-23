const env = require('../../config/env');

const PROVIDER_ENDPOINTS = Object.freeze({
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
  groq: 'https://api.groq.com/openai/v1/chat/completions',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
  cerebras: 'https://api.cerebras.ai/v1/chat/completions'
});

const DEFAULT_PROVIDER_ORDER = Object.freeze([
  'openrouter',
  'groq',
  'gemini',
  'cerebras'
]);

/**
 * @typedef {'openrouter'|'groq'|'gemini'|'cerebras'} ProviderName
 * @typedef {'rate_limit'|'timeout'|'authentication'|'configuration'|'upstream'|'network'|'invalid_response'} FailureCategory
 */

class ProviderAttemptError extends Error {
  constructor(category, status = null) {
    super('AI provider attempt failed');
    this.name = 'ProviderAttemptError';
    this.category = category;
    this.status = status;
  }
}

const toList = value => {
  if (Array.isArray(value)) {
    return value.map(item => String(item).trim()).filter(Boolean);
  }

  return String(value || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
};

const unique = values => [...new Set(values)];

const getProviderDefinitions = () => {
  const openRouterModels = unique([
    env.OPENROUTER_MODEL || 'openrouter/free',
    ...toList(env.OPENROUTER_FALLBACK_MODELS)
  ]);

  return {
    openrouter: {
      name: 'openrouter',
      endpoint: PROVIDER_ENDPOINTS.openrouter,
      apiKey: String(env.OPENROUTER_API_KEY || '').trim(),
      modelFields: openRouterModels.length > 1
        ? { models: openRouterModels }
        : { model: openRouterModels[0] },
      maxTokensField: 'max_tokens',
      headers: {
        ...(env.CLIENT_URL ? { 'HTTP-Referer': env.CLIENT_URL } : {}),
        'X-Title': 'AgriculNet AI'
      }
    },
    groq: {
      name: 'groq',
      endpoint: PROVIDER_ENDPOINTS.groq,
      apiKey: String(env.GROQ_API_KEY || '').trim(),
      modelFields: { model: env.GROQ_MODEL || 'openai/gpt-oss-20b' },
      maxTokensField: 'max_completion_tokens',
      headers: {}
    },
    gemini: {
      name: 'gemini',
      endpoint: PROVIDER_ENDPOINTS.gemini,
      apiKey: String(env.GEMINI_API_KEY || '').trim(),
      modelFields: { model: env.GEMINI_MODEL || 'gemini-3.1-flash-lite' },
      maxTokensField: 'max_tokens',
      headers: { 'x-goog-api-client': 'agriculnet-ai/1.0' }
    },
    cerebras: {
      name: 'cerebras',
      endpoint: PROVIDER_ENDPOINTS.cerebras,
      apiKey: String(env.CEREBRAS_API_KEY || '').trim(),
      modelFields: { model: env.CEREBRAS_MODEL || 'gpt-oss-120b' },
      maxTokensField: 'max_completion_tokens',
      headers: { 'X-Cerebras-Version-Patch': '2' }
    }
  };
};

const getConfiguredProviders = () => {
  const definitions = getProviderDefinitions();
  const requestedOrder = toList(env.AI_PROVIDER_ORDER)
    .map(provider => provider.toLowerCase());
  const order = requestedOrder.length > 0 ? requestedOrder : DEFAULT_PROVIDER_ORDER;

  return unique(order)
    .map(provider => definitions[provider])
    .filter(provider => provider && String(provider.apiKey || '').trim());
};

const classifyStatus = status => {
  if ([402, 429].includes(status)) return 'rate_limit';
  if ([408, 504].includes(status)) return 'timeout';
  if ([401, 403].includes(status)) return 'authentication';
  if ([400, 404, 422].includes(status)) return 'configuration';
  return 'upstream';
};

const requestProviderReply = async ({ provider, messages, systemPrompt, signal }) => {
  let response;
  try {
    const body = {
      ...provider.modelFields,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.4,
      stream: false,
      [provider.maxTokensField]: 600
    };

    response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
        ...provider.headers
      },
      body: JSON.stringify(body),
      signal
    });
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new ProviderAttemptError('timeout');
    }

    throw new ProviderAttemptError('network');
  }

  if (!response.ok) {
    try {
      await response.body?.cancel?.();
    } catch {
      // Ignore cleanup failures and continue to the next configured provider.
    }
    throw new ProviderAttemptError(classifyStatus(response.status), response.status);
  }

  let payload;
  try {
    payload = await response.json();
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new ProviderAttemptError('timeout');
    }

    throw new ProviderAttemptError('invalid_response', response.status);
  }

  const reply = payload?.choices?.[0]?.message?.content;
  if (typeof reply !== 'string' || !reply.trim()) {
    throw new ProviderAttemptError('invalid_response', response.status);
  }

  return reply.trim();
};

module.exports = {
  DEFAULT_PROVIDER_ORDER,
  PROVIDER_ENDPOINTS,
  ProviderAttemptError,
  getConfiguredProviders,
  requestProviderReply
};
