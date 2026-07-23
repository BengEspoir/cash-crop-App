jest.mock('../../config/env', () => ({
  AI_PROVIDER_ORDER: ['openrouter', 'groq', 'gemini', 'cerebras'],
  OPENROUTER_API_KEY: 'test-openrouter-key',
  OPENROUTER_MODEL: 'openrouter/free',
  OPENROUTER_FALLBACK_MODELS: [],
  GROQ_API_KEY: '',
  GROQ_MODEL: 'openai/gpt-oss-20b',
  GEMINI_API_KEY: '',
  GEMINI_MODEL: 'gemini-3.1-flash-lite',
  CEREBRAS_API_KEY: '',
  CEREBRAS_MODEL: 'gpt-oss-120b',
  AI_REQUEST_TIMEOUT_MS: 100,
  AI_PROVIDER_TIMEOUT_MS: 20,
  CLIENT_URL: 'http://localhost:3000'
}));

jest.mock('../../utils/logger', () => ({
  warn: jest.fn()
}));

const env = require('../../config/env');
const logger = require('../../utils/logger');
const {
  generateReply,
  SYSTEM_PROMPT,
  OPENROUTER_CHAT_URL,
  PROVIDER_ENDPOINTS
} = require('./chat.service');

const successResponse = content => ({
  ok: true,
  status: 200,
  json: jest.fn().mockResolvedValue({
    choices: [{ message: { content } }]
  })
});

describe('chat service provider fallbacks', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    env.AI_PROVIDER_ORDER = ['openrouter', 'groq', 'gemini', 'cerebras'];
    env.OPENROUTER_API_KEY = 'test-openrouter-key';
    env.OPENROUTER_MODEL = 'openrouter/free';
    env.OPENROUTER_FALLBACK_MODELS = [];
    env.GROQ_API_KEY = '';
    env.GROQ_MODEL = 'openai/gpt-oss-20b';
    env.GEMINI_API_KEY = '';
    env.GEMINI_MODEL = 'gemini-3.1-flash-lite';
    env.CEREBRAS_API_KEY = '';
    env.CEREBRAS_MODEL = 'gpt-oss-120b';
    env.AI_REQUEST_TIMEOUT_MS = 100;
    env.AI_PROVIDER_TIMEOUT_MS = 20;
    logger.warn.mockReset();
    global.fetch = jest.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  test('uses OpenRouter first, protects the system prompt, and returns a trimmed reply', async () => {
    global.fetch.mockResolvedValue(successResponse('  Visit the verified farmer directory.  '));

    const messages = [{ role: 'user', content: 'Where can I find cocoa farmers?' }];
    await expect(generateReply(messages)).resolves.toBe('Visit the verified farmer directory.');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(url).toBe(OPENROUTER_CHAT_URL);
    expect(options.headers).toMatchObject({
      Authorization: 'Bearer test-openrouter-key',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'AgriculNet AI'
    });
    expect(body).toMatchObject({
      model: 'openrouter/free',
      max_tokens: 600,
      temperature: 0.4,
      stream: false
    });
    expect(body.messages[0]).toEqual({ role: 'system', content: SYSTEM_PROMPT });
    expect(SYSTEM_PROMPT).toContain('/find-farmers');
    expect(body.messages.slice(1)).toEqual(messages);
  });

  test('passes an ordered OpenRouter model fallback list when configured', async () => {
    env.OPENROUTER_FALLBACK_MODELS = [
      'meta-llama/example:free',
      'qwen/example:free'
    ];
    global.fetch.mockResolvedValue(successResponse('Fallback routing enabled'));

    await generateReply([{ role: 'user', content: 'Hello' }]);

    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.models).toEqual([
      'openrouter/free',
      'meta-llama/example:free',
      'qwen/example:free'
    ]);
    expect(body).not.toHaveProperty('model');
  });

  test('falls back from a throttled OpenRouter request to Groq', async () => {
    env.GROQ_API_KEY = 'test-groq-key';
    global.fetch
      .mockResolvedValueOnce({ ok: false, status: 429 })
      .mockResolvedValueOnce(successResponse('Groq answered'));

    await expect(generateReply([{ role: 'user', content: 'Hello' }]))
      .resolves.toBe('Groq answered');

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch.mock.calls[1][0]).toBe(PROVIDER_ENDPOINTS.groq);
    const groqBody = JSON.parse(global.fetch.mock.calls[1][1].body);
    expect(groqBody).toMatchObject({
      model: 'openai/gpt-oss-20b',
      max_completion_tokens: 600
    });
    expect(groqBody).not.toHaveProperty('max_tokens');
  });

  test('falls back from an OpenRouter network error to Gemini', async () => {
    env.GEMINI_API_KEY = 'test-gemini-key';
    global.fetch
      .mockRejectedValueOnce(new Error('private network detail'))
      .mockResolvedValueOnce(successResponse('Gemini answered'));

    await expect(generateReply([{ role: 'user', content: 'Bonjour' }]))
      .resolves.toBe('Gemini answered');

    expect(global.fetch.mock.calls[1][0]).toBe(PROVIDER_ENDPOINTS.gemini);
    expect(global.fetch.mock.calls[1][1].headers.Authorization)
      .toBe('Bearer test-gemini-key');
    const geminiBody = JSON.parse(global.fetch.mock.calls[1][1].body);
    expect(geminiBody.model).toBe('gemini-3.1-flash-lite');
    expect(geminiBody.messages[0]).toEqual({ role: 'system', content: SYSTEM_PROMPT });
  });

  test('falls back from a malformed reply to Cerebras', async () => {
    env.CEREBRAS_API_KEY = 'test-cerebras-key';
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ choices: [] })
      })
      .mockResolvedValueOnce(successResponse('Cerebras answered'));

    await expect(generateReply([{ role: 'user', content: 'Hello' }]))
      .resolves.toBe('Cerebras answered');

    expect(global.fetch.mock.calls[1][0]).toBe(PROVIDER_ENDPOINTS.cerebras);
    expect(global.fetch.mock.calls[1][1].headers).toMatchObject({
      Authorization: 'Bearer test-cerebras-key',
      'X-Cerebras-Version-Patch': '2'
    });
    const cerebrasBody = JSON.parse(global.fetch.mock.calls[1][1].body);
    expect(cerebrasBody.max_completion_tokens).toBe(600);
    expect(cerebrasBody).not.toHaveProperty('max_tokens');
  });

  test('skips missing keys and de-duplicates the configured provider order', async () => {
    env.OPENROUTER_API_KEY = '';
    env.GROQ_API_KEY = 'test-groq-key';
    env.AI_PROVIDER_ORDER = ['gemini', 'groq', 'groq', 'unknown'];
    global.fetch.mockResolvedValue(successResponse('Only Groq was configured'));

    await expect(generateReply([{ role: 'user', content: 'Hello' }]))
      .resolves.toBe('Only Groq was configured');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch.mock.calls[0][0]).toBe(PROVIDER_ENDPOINTS.groq);
  });

  test('returns a 503 operational error when no provider key is configured', async () => {
    env.OPENROUTER_API_KEY = '';
    env.GROQ_API_KEY = '';
    env.GEMINI_API_KEY = '';
    env.CEREBRAS_API_KEY = '';

    await expect(generateReply([{ role: 'user', content: 'Hello' }])).rejects.toMatchObject({
      statusCode: 503,
      errorCode: 'AI_NOT_CONFIGURED',
      isOperational: true
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('returns 429 only after every configured provider is throttled', async () => {
    env.GROQ_API_KEY = 'test-groq-key';
    env.GEMINI_API_KEY = 'test-gemini-key';
    env.CEREBRAS_API_KEY = 'test-cerebras-key';
    global.fetch.mockResolvedValue({ ok: false, status: 429 });

    await expect(generateReply([{ role: 'user', content: 'Hello' }])).rejects.toMatchObject({
      statusCode: 429,
      errorCode: 'AI_RATE_LIMITED'
    });
    expect(global.fetch).toHaveBeenCalledTimes(4);
  });

  test('returns 504 after every configured provider times out', async () => {
    env.GROQ_API_KEY = 'test-groq-key';
    const abortError = Object.assign(new Error('request aborted'), { name: 'AbortError' });
    global.fetch.mockRejectedValue(abortError);

    await expect(generateReply([{ role: 'user', content: 'Hello' }])).rejects.toMatchObject({
      statusCode: 504,
      errorCode: 'AI_REQUEST_TIMEOUT'
    });
  });

  test('keeps the timeout active while reading a stalled response body', async () => {
    jest.useFakeTimers({ now: 0 });
    env.AI_REQUEST_TIMEOUT_MS = 30;
    global.fetch.mockImplementation((url, options) => Promise.resolve({
      ok: true,
      status: 200,
      json: () => new Promise((resolve, reject) => {
        options.signal.addEventListener('abort', () => {
          reject(Object.assign(new Error('response body aborted'), { name: 'AbortError' }));
        }, { once: true });
      })
    }));

    try {
      const result = generateReply([{ role: 'user', content: 'Hello' }]);
      const assertion = expect(result).rejects.toMatchObject({
        statusCode: 504,
        errorCode: 'AI_REQUEST_TIMEOUT'
      });
      await jest.advanceTimersByTimeAsync(30);
      await assertion;
    } finally {
      jest.useRealTimers();
    }
  });

  test('stops starting providers when the total chain deadline is exhausted', async () => {
    jest.useFakeTimers({ now: 0 });
    env.GROQ_API_KEY = 'test-groq-key';
    env.GEMINI_API_KEY = 'test-gemini-key';
    env.AI_REQUEST_TIMEOUT_MS = 35;
    env.AI_PROVIDER_TIMEOUT_MS = 20;
    global.fetch.mockImplementation((url, options) => new Promise((resolve, reject) => {
      options.signal.addEventListener('abort', () => {
        reject(Object.assign(new Error('request aborted'), { name: 'AbortError' }));
      }, { once: true });
    }));

    try {
      const result = generateReply([{ role: 'user', content: 'Hello' }]);
      const assertion = expect(result).rejects.toMatchObject({
        statusCode: 504,
        errorCode: 'AI_REQUEST_TIMEOUT'
      });

      await jest.advanceTimersByTimeAsync(20);
      expect(global.fetch).toHaveBeenCalledTimes(2);
      await jest.advanceTimersByTimeAsync(15);
      await assertion;
      expect(global.fetch).toHaveBeenCalledTimes(2);
    } finally {
      jest.useRealTimers();
    }
  });

  test('returns a sanitized 502 after mixed provider failures', async () => {
    env.GROQ_API_KEY = 'test-groq-key';
    global.fetch
      .mockRejectedValueOnce(new Error('provider response contained a secret'))
      .mockResolvedValueOnce({ ok: false, status: 500 });

    await expect(generateReply([{ role: 'user', content: 'Hello' }])).rejects.toMatchObject({
      statusCode: 502,
      errorCode: 'AI_PROVIDER_ERROR',
      message: 'The AI assistant is temporarily unavailable'
    });

    expect(JSON.stringify(logger.warn.mock.calls)).not.toContain('secret');
    expect(logger.warn).toHaveBeenCalledWith('AI provider attempt failed', {
      provider: 'openrouter',
      category: 'network',
      status: null
    });
  });
});
