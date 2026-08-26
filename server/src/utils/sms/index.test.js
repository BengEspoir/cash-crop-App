const mockTwilioMessagesCreate = jest.fn();

jest.mock('../../config/env', () => ({
  SMS_PRIMARY_PROVIDER: 'africastalking',
  SMS_TEST_OTP: {},
  SMS_DEV_FIXED_OTP: '',
  EXPOSE_DEV_AUTH_HINTS: true,
  ALLOW_DEV_DELIVERY_FALLBACK: false,
  AT_API_KEY: '',
  AT_USERNAME: '',
  AT_SENDER_ID: '',
  AT_SANDBOX: true,
  TWILIO_ACCOUNT_SID: '',
  TWILIO_AUTH_TOKEN: '',
  TWILIO_PHONE_NUMBER: '',
  TWILIO_MESSAGING_SERVICE_SID: ''
}));

jest.mock('twilio', () => jest.fn(() => ({
  messages: {
    create: (...args) => mockTwilioMessagesCreate(...args)
  }
})));

const env = require('../../config/env');
const { getTestOtp, selectProvider, sendOtpSms } = require('./index');

describe('SMS OTP provider routing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    env.SMS_PRIMARY_PROVIDER = 'africastalking';
    env.SMS_TEST_OTP = {};
    env.SMS_DEV_FIXED_OTP = '';
    env.EXPOSE_DEV_AUTH_HINTS = true;
    env.ALLOW_DEV_DELIVERY_FALLBACK = false;
    env.AT_API_KEY = '';
    env.AT_USERNAME = '';
    env.AT_SANDBOX = true;
    env.TWILIO_ACCOUNT_SID = '';
    env.TWILIO_AUTH_TOKEN = '';
    env.TWILIO_PHONE_NUMBER = '';
    env.TWILIO_MESSAGING_SERVICE_SID = '';
  });

  test('returns a fixed development OTP without contacting an SMS provider', async () => {
    env.SMS_TEST_OTP = { '+237600000000': '123456' };

    expect(getTestOtp('237 600 000 000')).toBe('123456');
    await expect(sendOtpSms('+237600000000', '123456')).resolves.toMatchObject({
      success: true,
      delivered: false,
      provider: 'test-phone',
      devHints: {
        phoneNumber: '+237600000000'
      }
    });
    expect(mockTwilioMessagesCreate).not.toHaveBeenCalled();
  });

  test('uses the development-wide fixed OTP for any phone number', async () => {
    env.SMS_DEV_FIXED_OTP = '123456';

    expect(getTestOtp('+237699999999')).toBe('123456');
    await expect(sendOtpSms('+237699999999', '123456')).resolves.toMatchObject({
      success: true,
      delivered: false,
      provider: 'test-phone',
      devHints: {
        otpCode: '123456'
      }
    });
    expect(mockTwilioMessagesCreate).not.toHaveBeenCalled();
  });

  test('honors an explicit Twilio primary provider for Cameroon numbers', () => {
    env.SMS_PRIMARY_PROVIDER = 'twilio';
    expect(selectProvider('+237600000000')).toBe('twilio');
  });

  test('sends through a Twilio Messaging Service when configured', async () => {
    env.SMS_PRIMARY_PROVIDER = 'twilio';
    env.TWILIO_ACCOUNT_SID = 'AC_test';
    env.TWILIO_AUTH_TOKEN = 'token';
    env.TWILIO_MESSAGING_SERVICE_SID = 'MG_test';
    mockTwilioMessagesCreate.mockResolvedValue({
      sid: 'SM_test',
      status: 'queued'
    });

    await expect(sendOtpSms('+237699123456', '654321')).resolves.toMatchObject({
      success: true,
      delivered: true,
      provider: 'twilio',
      messageId: 'SM_test'
    });
    expect(mockTwilioMessagesCreate).toHaveBeenCalledWith({
      body: 'Your AgriculNet code: 654321. Valid 10 min. Do not share.',
      to: '+237699123456',
      messagingServiceSid: 'MG_test'
    });
  });
});
