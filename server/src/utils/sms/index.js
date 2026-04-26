/**
 * Multi-provider SMS service
 * Routes messages to appropriate provider based on destination country
 */

const env = require('../../config/env');
const { getCountryByDialCode } = require('../countries');

// Provider: Africa's Talking (primary for Africa)
const sendAfricasTalking = async (phoneNumber, message) => {
  const AfricasTalking = require('africastalking');
  
  const africasTalking = AfricasTalking({
    apiKey: env.AT_API_KEY,
    username: env.AT_USERNAME
  });

  const response = await africasTalking.SMS.send({
    to: [phoneNumber],
    message,
    from: env.AT_SENDER_ID
  });

  return {
    success: true,
    delivered: true,
    provider: 'africas-talking',
    messageId: response.SMSMessageData?.Recipients?.[0]?.messageId
  };
};

// Provider: Twilio (for international numbers)
const sendTwilio = async (phoneNumber, message) => {
  const twilio = require('twilio');
  
  const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  
  const response = await client.messages.create({
    body: message,
    from: env.TWILIO_PHONE_NUMBER,
    to: phoneNumber
  });

  return {
    success: true,
    delivered: response.status === 'queued' || response.status === 'sent',
    provider: 'twilio',
    messageId: response.sid,
    status: response.status
  };
};

// Select provider based on country
const selectProvider = (phoneNumber) => {
  // Extract dial code
  const match = phoneNumber.match(/^\+(\d+)/);
  if (!match) return env.SMS_PRIMARY_PROVIDER || 'africastalking';
  
  const dialCode = `+${match[1]}`;
  const country = getCountryByDialCode(dialCode);
  
  // Use Africa's Talking for African countries
  const africanCountries = ['+237', '+234', '+233', '+254', '+255', '+256', '+250', '+254', '+27', '+212', '+213'];
  if (africanCountries.includes(dialCode)) {
    return 'africas talking';
  }
  
  // Use Twilio for others (if configured)
  if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN) {
    return 'twilio';
  }
  
  return env.SMS_PRIMARY_PROVIDER || 'africas talking';
};

// Main send function
const sendSms = async (phoneNumber, message, options = {}) => {
  const devHints = env.EXPOSE_DEV_AUTH_HINTS
    ? { phoneNumber, message }
    : null;

  // Development fallback
  if (!env.AT_API_KEY && !env.TWILIO_ACCOUNT_SID) {
    if (env.ALLOW_DEV_DELIVERY_FALLBACK) {
      return {
        success: true,
        delivered: false,
        provider: 'development-fallback',
        devHints
      };
    }
    throw new Error('No SMS provider configured');
  }

  const provider = options.provider || selectProvider(phoneNumber);

  try {
    let result;
    
    switch (provider) {
      case 'twilio':
        if (!env.TWILIO_ACCOUNT_SID) {
          throw new Error('Twilio not configured');
        }
        result = await sendTwilio(phoneNumber, message);
        break;
      case 'africas talking':
      default:
        if (!env.AT_API_KEY) {
          throw new Error('Africa\'s Talking not configured');
        }
        result = await sendAfricasTalking(phoneNumber, message);
        break;
    }

    return {
      ...result,
      devHints
    };
  } catch (error) {
    // Try fallback if primary fails
    if (options.provider !== 'twilio' && env.TWILIO_ACCOUNT_SID) {
      try {
        const fallback = await sendTwilio(phoneNumber, message);
        return {
          ...fallback,
          fallback: true,
          originalError: error.message,
          devHints
        };
      } catch (fallbackError) {
        // Both failed
      }
    }

    if (env.ALLOW_DEV_DELIVERY_FALLBACK) {
      return {
        success: true,
        delivered: false,
        provider: 'development-fallback',
        error: error.message,
        devHints
      };
    }

    throw error;
  }
};

// Send OTP specifically
const sendOtpSms = async (phoneNumber, otp) => {
  const message = `Your AgriculNet code: ${otp}. Valid 10 min. Do not share.`;
  return sendSms(phoneNumber, message);
};

module.exports = {
  sendSms,
  sendOtpSms,
  selectProvider
};
