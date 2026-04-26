/**
 * Global phone validation utility
 * Supports Cameroon (local) and international formats
 */

const { validatePhoneForCountry, formatPhoneInternational, getCountryByCode } = require('./countries');

// Validate phone based on user type and country
const validatePhone = (phone, userType, countryCode = 'CM') => {
  // Clean the phone number
  const cleanPhone = phone.replace(/[\s\-]/g, '');
  
  // Local buyers must use Cameroon
  if (userType === 'local') {
    const result = validatePhoneForCountry(cleanPhone, 'CM');
    return {
      ...result,
      normalized: result.valid ? `+237${cleanPhone}` : null
    };
  }
  
  // International buyers use their selected country
  const result = validatePhoneForCountry(cleanPhone, countryCode);
  return {
    ...result,
    normalized: result.valid ? formatPhoneInternational(cleanPhone, countryCode) : null
  };
};

// Normalize phone to international format
const normalizePhone = (phone, countryCode = 'CM') => {
  const cleanPhone = phone.replace(/[\s\-]/g, '');
  return formatPhoneInternational(cleanPhone, countryCode);
};

// Check if phone is in international format
const isInternationalFormat = (phone) => {
  return phone.startsWith('+');
};

// Extract country code from international phone
const extractCountryFromPhone = (phone) => {
  if (!isInternationalFormat(phone)) return null;
  
  // Try to match dial codes (longer codes first)
  const { countries } = require('./countries');
  const sortedCodes = [...countries].sort((a, b) => 
    b.dialCode.length - a.dialCode.length
  );
  
  for (const country of sortedCodes) {
    if (phone.startsWith(country.dialCode)) {
      return country;
    }
  }
  
  return null;
};

// Mask phone number for display
const maskPhone = (phone) => {
  if (!phone || phone.length < 6) return phone;
  
  // Keep country code and last 3 digits
  const country = extractCountryFromPhone(phone);
  if (country) {
    const nationalNumber = phone.substring(country.dialCode.length);
    if (nationalNumber.length < 6) return phone;
    return `${country.dialCode}***${nationalNumber.slice(-3)}`;
  }
  
  // Fallback for non-international format
  return phone.slice(0, -6) + '***' + phone.slice(-3);
};

module.exports = {
  validatePhone,
  normalizePhone,
  isInternationalFormat,
  extractCountryFromPhone,
  maskPhone
};
