/**
 * SMS utility - Re-export from multi-provider service
 * Maintains backward compatibility with existing imports
 */

const { sendOtpSms, sendSms } = require('./sms/index');

module.exports = {
  sendOtpSms,
  sendSms
};
