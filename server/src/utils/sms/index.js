/**
 * Multi-provider SMS service
 * Routes messages to appropriate provider based on destination country
 */

const env = require('../../config/env');
const { countries } = require('../countries');

const getAfricasTalkingUsername = () => (
  env.AT_SANDBOX ? 'sandbox' : env.AT_USERNAME
);

const getRecipientStatus = (recipient = {}) => {
  const status = String(recipient.status || '').toLowerCase();
  if (!status) {
    return 'unknown';
  }

  if (status.includes('success') || status.includes('sent') || status.includes('queued')) {
    return 'accepted';
  }

  return 'rejected';
};

// Provider: Africa's Talking (primary for Africa)
const sendAfricasTalking = async (phoneNumber, message) => {
  const AfricasTalking = require('africastalking');
  const username = getAfricasTalkingUsername();

  if (!env.AT_API_KEY) {
    throw new Error('Africa\'s Talking API key not configured');
  }

  if (!username) {
    throw new Error('Africa\'s Talking username not configured');
  }
  
  const africasTalking = AfricasTalking({
    apiKey: env.AT_API_KEY,
    username
  });

  const options = {
    to: [phoneNumber],
    message
  };

  if (env.AT_SENDER_ID && !env.AT_SANDBOX) {
    options.from = env.AT_SENDER_ID;
  }

  const response = await africasTalking.SMS.send(options);
  const recipients = response.SMSMessageData?.Recipients || [];
  const rejectedRecipients = recipients.filter((recipient) => getRecipientStatus(recipient) === 'rejected');
  const acceptedRecipients = recipients.filter((recipient) => getRecipientStatus(recipient) === 'accepted');
  const firstRecipient = recipients[0] || {};
  const delivered = recipients.length > 0
    ? rejectedRecipients.length === 0 && acceptedRecipients.length > 0
    : false;

  return {
    success: delivered,
    delivered,
    provider: 'africas-talking',
    messageId: firstRecipient.messageId,
    status: firstRecipient.status || response.SMSMessageData?.Message || null,
    error: delivered ? null : (firstRecipient.status || response.SMSMessageData?.Message || 'SMS rejected by Africa\'s Talking'),
    cost: firstRecipient.cost || null,
    accepted: acceptedRecipients.length,
    rejected: rejectedRecipients.length
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
  if (!phoneNumber.startsWith('+')) {
    return env.SMS_PRIMARY_PROVIDER || 'africastalking';
  }

  const match = [...countries]
    .sort((left, right) => right.dialCode.length - left.dialCode.length)
    .find((country) => phoneNumber.startsWith(country.dialCode));

  const dialCode = match?.dialCode;
  const africanCountries = ['+237', '+234', '+233', '+254', '+255', '+256', '+250', '+27', '+212', '+213'];
  if (dialCode && africanCountries.includes(dialCode)) {
    return 'africastalking';
  }

  if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN) {
    return 'twilio';
  }

  return env.SMS_PRIMARY_PROVIDER || 'africastalking';
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
      case 'africastalking':
      default:
        if (!env.AT_API_KEY || (!env.AT_USERNAME && !env.AT_SANDBOX)) {
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
