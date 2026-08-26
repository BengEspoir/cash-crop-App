const env = require('../../config/env');
const { ERROR_CODES } = require('../../config/constants');
const logger = require('../../utils/logger');
const AppError = require('../../utils/AppError');
const {
  PROVIDER_ENDPOINTS,
  ProviderAttemptError,
  getConfiguredProviders,
  requestProviderReply
} = require('./chat.providers');

const OPENROUTER_CHAT_URL = PROVIDER_ENDPOINTS.openrouter;

// Environment values are captured at process startup; restart the API after
// changing server/.env so newly added or rotated provider keys are loaded.

const SYSTEM_PROMPT = `AgriculNet AI: An expert guide for the AgriculNet.farm platform assisting farmers, buyers, and platform users with crop advice, agricultural inquiries, and site navigation.

Give practical, concise guidance suited to farming and trade in Cameroon. Reply in the language used by the user, especially English or French. For site navigation, use AgriculNet's real routes: /browse and /find-farmers for marketplace discovery, /sell for selling information, /auth/login and /register for account access, and /farmer/dashboard, /buyer/dashboard, or /admin/dashboard for role-specific workspaces. Do not invent platform features or claim to perform actions for the user.

Never ask for or expose passwords, identity documents, payment credentials, API keys, or other sensitive information. Agricultural guidance is educational: advise users to follow product labels and consult a qualified local agronomist for crop treatments, and direct emergencies to appropriate local services.`;

const providerError = () =>
  new AppError(
    'The AI assistant is temporarily unavailable',
    502,
    ERROR_CODES.AI_PROVIDER_ERROR
  );

const generateReply = async messages => {
  const providers = getConfiguredProviders();
  if (providers.length === 0) {
    throw new AppError(
      'The AI assistant is not configured',
      503,
      ERROR_CODES.AI_NOT_CONFIGURED
    );
  }

  const totalTimeoutMs = Number(env.AI_REQUEST_TIMEOUT_MS) || 45 * 1000;
  const providerTimeoutMs = Number(env.AI_PROVIDER_TIMEOUT_MS) || 10 * 1000;
  const deadline = Date.now() + totalTimeoutMs;
  const failures = [];

  for (const provider of providers) {
    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) break;

    const attemptTimeoutMs = providers.length === 1
      ? remainingMs
      : Math.min(providerTimeoutMs, remainingMs);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), attemptTimeoutMs);

    try {
      return await requestProviderReply({
        provider,
        messages,
        systemPrompt: SYSTEM_PROMPT,
        signal: controller.signal
      });
    } catch (error) {
      const failure = {
        provider: provider.name,
        category: error instanceof ProviderAttemptError ? error.category : 'upstream',
        status: Number.isInteger(error?.status) ? error.status : null
      };
      failures.push(failure);

      // Never log prompts, credentials, request headers, or upstream bodies.
      logger.warn('AI provider attempt failed', failure);
    } finally {
      clearTimeout(timeout);
    }
  }

  if (failures.length > 0 && failures.every(failure => failure.category === 'rate_limit')) {
    throw new AppError(
      'The AI service is busy, please try again later',
      429,
      ERROR_CODES.AI_RATE_LIMITED
    );
  }

  if (
    Date.now() >= deadline ||
    (failures.length > 0 && failures.every(failure => failure.category === 'timeout'))
  ) {
    throw new AppError(
      'The AI assistant took too long to respond',
      504,
      ERROR_CODES.AI_REQUEST_TIMEOUT
    );
  }

  throw providerError();
};

module.exports = {
  generateReply,
  SYSTEM_PROMPT,
  OPENROUTER_CHAT_URL,
  PROVIDER_ENDPOINTS
};
