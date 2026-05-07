require('dotenv').config({ quiet: true });

const env = require('./src/config/env');
const { sendSms } = require('./src/utils/sms');

const maskPhone = (value = '') => {
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return value ? 'configured' : '(empty)';
  return `${String(value).trim().slice(0, 4)}***${digits.slice(-3)}`;
};

const maskValue = (value = '') => {
  if (!value) return '(empty)';
  if (value.length <= 4) return 'configured';
  return `${value.slice(0, 2)}***${value.slice(-2)}`;
};

const sanitizeError = (error) => {
  const message = error?.message || String(error || '');

  if (/Invalid API key|Invalid API Key|Unauthorized|401|403/i.test(message)) {
    return 'Africa\'s Talking rejected the configured API key or username.';
  }

  if (/must be a valid phone number|invalid phone/i.test(message)) {
    return 'The test phone number is invalid. Use international format, for example +2376XXXXXXXX.';
  }

  if (/ENOTFOUND|ECONNREFUSED|ETIMEDOUT|fetch failed|getaddrinfo/i.test(message)) {
    return 'Africa\'s Talking could not be reached. Check network access and provider availability.';
  }

  return message || 'SMS diagnostic failed.';
};

const getArgValue = (name) => (
  process.argv.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1)
);

async function checkAfricasTalkingCredentials() {
  const AfricasTalking = require('africastalking');
  const username = env.AT_SANDBOX ? 'sandbox' : env.AT_USERNAME;

  if (!env.AT_API_KEY) {
    throw new Error('AT_API_KEY is not configured.');
  }

  if (!username) {
    throw new Error('AT_USERNAME is not configured.');
  }

  const africasTalking = AfricasTalking({
    apiKey: env.AT_API_KEY,
    username
  });

  await africasTalking.APPLICATION.fetchApplicationData();
}

async function diagnoseSms() {
  const checkOnly = process.argv.includes('--check-only');
  const explicitRecipient = getArgValue('--to');
  const recipient = explicitRecipient || process.env.SMS_TEST_TO;
  const username = env.AT_SANDBOX ? 'sandbox' : env.AT_USERNAME;

  console.log('Testing SMS configuration...');
  console.log('Primary provider:', env.SMS_PRIMARY_PROVIDER || 'africastalking');
  console.log('Africa\'s Talking sandbox:', String(env.AT_SANDBOX));
  console.log('Africa\'s Talking username:', maskValue(username));
  console.log('Africa\'s Talking API key:', env.AT_API_KEY ? `set (${env.AT_API_KEY.length} chars)` : '(empty)');
  console.log('Africa\'s Talking sender ID:', env.AT_SANDBOX ? '(not used in sandbox)' : (env.AT_SENDER_ID || '(empty)'));
  console.log('Mode:', checkOnly ? 'credential check only' : 'credential check + test SMS');

  try {
    await checkAfricasTalkingCredentials();
    console.log('Africa\'s Talking credentials accepted.');

    if (checkOnly) {
      return;
    }

    if (!recipient) {
      throw new Error('No test recipient provided. Use --to=+2376XXXXXXXX or set SMS_TEST_TO.');
    }

    const result = await sendSms(
      recipient,
      'AgriculNet SMS diagnostic: your SMS provider is working.',
      { provider: 'africastalking' }
    );

    console.log('Test SMS requested.');
    console.log('Recipient:', maskPhone(recipient));
    console.log('Provider:', result.provider);
    console.log('Delivered:', String(Boolean(result.delivered)));
    console.log('Status:', result.status || '(none)');
    console.log('Message ID:', result.messageId || '(none)');
    console.log('Cost:', result.cost || '(none)');

    if (!result.delivered) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('SMS Error:', sanitizeError(error));
    console.error('Africa\'s Talking checklist: use AT_USERNAME=sandbox with sandbox keys, or AT_SANDBOX=false with your live app username and live API key.');
    process.exitCode = 1;
  }
}

diagnoseSms();
