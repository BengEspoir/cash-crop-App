const Joi = require('joi');
const { CAMEROON_REGIONS, BUYER_TYPES } = require('../../config/constants');
const { getCountryByCode, validatePhoneForCountry } = require('../../utils/countries');

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const phonePattern = /^\+237[0-9]{9}$/;
const cameroonNationalPattern = /^6\d{8}$/;
const acceptedTerms = Joi.boolean().valid(true);

const normalizeCountryCode = (value = '') => String(value).trim().toUpperCase();

const stripToDigits = (value = '') => String(value).replace(/\D/g, '');

const looksLikeCameroonPhone = (value = '') => {
  const digits = stripToDigits(value);
  const nationalNumber = digits.startsWith('237') ? digits.slice(3) : digits;
  return cameroonNationalPattern.test(nationalNumber);
};

const registerFarmerSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  phone: Joi.string().pattern(phonePattern).required().messages({
    'string.pattern.base': 'Phone must be a valid Cameroon number (+237XXXXXXXXX)'
  }),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).pattern(passwordPattern).required().messages({
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match'
  }),
  region: Joi.string().valid(...CAMEROON_REGIONS).required(),
  city: Joi.string().min(2).max(100).required(),
  primaryCrop: Joi.string().min(2).max(120).optional(),
  harvestVolume: Joi.string().min(2).max(120).optional(),
  cooperative: Joi.string().max(200).allow('').optional(),
  farmName: Joi.string().max(200).allow('').optional(),
  cropsGrown: Joi.array().items(Joi.string()).max(20).optional(),
  exportReady: Joi.boolean().optional(),
  inspectionPreference: Joi.string().max(200).allow('').optional(),
  payoutMethod: Joi.string().max(100).allow('').optional(),
  accountName: Joi.string().max(200).allow('').optional(),
  payoutPhone: Joi.string().pattern(phonePattern).allow('', null).optional().messages({
    'string.pattern.base': 'Payout phone must be a valid Cameroon number (+237XXXXXXXXX)'
  }),
  notificationOptIn: Joi.boolean().optional(),
  acceptedTerms: acceptedTerms.optional(),
  agreeToTerms: acceptedTerms.optional()
})
  .or('acceptedTerms', 'agreeToTerms')
  .messages({
    'object.missing': 'You must agree to the terms and conditions'
  });

const registerResellerSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  phone: Joi.string().pattern(phonePattern).required().messages({
    'string.pattern.base': 'Phone must be a valid Cameroon number (+237XXXXXXXXX)'
  }),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).pattern(passwordPattern).required().messages({
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match'
  }),
  region: Joi.string().valid(...CAMEROON_REGIONS).required(),
  city: Joi.string().min(2).max(100).required(),
  businessName: Joi.string().max(200).allow('', null).optional(),
  primaryCrop: Joi.string().min(2).max(120).allow('', null).optional(),
  cropsSold: Joi.array().items(Joi.string().max(120)).max(20).optional(),
  about: Joi.string().max(1000).allow('', null).optional(),
  payoutMethod: Joi.string().max(100).allow('').optional(),
  accountName: Joi.string().max(200).allow('').optional(),
  payoutPhone: Joi.string().pattern(phonePattern).allow('', null).optional().messages({
    'string.pattern.base': 'Payout phone must be a valid Cameroon number (+237XXXXXXXXX)'
  }),
  notificationOptIn: Joi.boolean().optional(),
  acceptedTerms: acceptedTerms.optional(),
  agreeToTerms: acceptedTerms.optional()
})
  .or('acceptedTerms', 'agreeToTerms')
  .messages({
    'object.missing': 'You must agree to the terms and conditions'
  });

const registerBuyerSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).optional(),
  lastName: Joi.string().min(2).max(100).optional(),
  contactName: Joi.string().min(2).max(200).optional(),
  phone: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).pattern(passwordPattern).required().messages({
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match'
  }),
  buyerType: Joi.string().valid(...Object.values(BUYER_TYPES)).required(),
  country: Joi.string().min(2).max(100).required(),
  countryCode: Joi.string().length(2).optional(),
  companyName: Joi.string().max(200).allow('', null).optional(),
  preferredCrops: Joi.array().items(Joi.string()).optional(),
  buyingFocus: Joi.string().max(255).allow('', null).optional(),
  monthlyVolume: Joi.string().max(120).allow('', null).optional(),
  destination: Joi.string().max(160).allow('', null).optional(),
  agreedToPolicy: acceptedTerms.optional(),
  agreeToTerms: acceptedTerms.optional()
})
  .custom((value, helpers) => {
    const hasExplicitName = value.firstName && value.lastName;
    if (!value.contactName && !hasExplicitName) {
      return helpers.error('any.custom', { message: 'Provide a contact name or separate first and last names' });
    }

    const countryCode = normalizeCountryCode(value.countryCode);

    if (value.buyerType === BUYER_TYPES.LOCAL || value.buyerType === BUYER_TYPES.BUSINESS) {
      if (!phonePattern.test(value.phone)) {
        return helpers.error('any.custom', {
          message: 'Local buyers must use a valid Cameroon phone number (+237XXXXXXXXX)'
        });
      }

      if (countryCode && countryCode !== 'CM') {
        return helpers.error('any.custom', {
          message: 'Local buyers must use countryCode CM'
        });
      }

      return value;
    }

    if (!countryCode) {
      return helpers.error('any.custom', {
        message: 'countryCode is required for international buyers'
      });
    }

    if (countryCode === 'CM' || String(value.country).trim().toLowerCase() === 'cameroon') {
      return helpers.error('any.custom', {
        message: 'International buyers must choose a country other than Cameroon'
      });
    }

    if (looksLikeCameroonPhone(value.phone)) {
      return helpers.error('any.custom', {
        message: 'Cameroon phone numbers are only allowed for local buyers'
      });
    }

    const country = getCountryByCode(countryCode);
    if (!country) {
      return helpers.error('any.custom', {
        message: 'countryCode is not supported'
      });
    }

    let digits = stripToDigits(value.phone);
    const dialDigits = stripToDigits(country.dialCode);
    if (digits.startsWith(dialDigits)) {
      digits = digits.slice(dialDigits.length);
    }

    const phoneCheck = validatePhoneForCountry(digits, countryCode);
    if (!phoneCheck.valid) {
      return helpers.error('any.custom', {
        message: `Phone must be valid for ${country.name}`
      });
    }

    return value;
  })
  .or('agreedToPolicy', 'agreeToTerms')
  .messages({
    'object.missing': 'You must agree to the terms and conditions',
    'any.custom': '{{#message}}'
  });

const loginSchema = Joi.object({
  identifier: Joi.string().required(),
  password: Joi.string().required(),
  rememberMe: Joi.boolean().optional()
});

const sendOtpSchema = Joi.object({
  phone: Joi.string().pattern(phonePattern).optional(),
  userId: Joi.string().uuid().optional(),
  purpose: Joi.string().optional()
}).xor('phone', 'userId').messages({
  'object.xor': 'Either phone or userId must be provided'
});

const confirmOtpSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  otp: Joi.string().length(6).pattern(/^\d{6}$/).required().messages({
    'string.pattern.base': 'OTP must be 6 digits'
  })
});

const forgotPasswordSchema = Joi.object({
  identifier: Joi.string().required(),
  method: Joi.string().valid('sms', 'email').required()
});

const resetPasswordSchema = Joi.object({
  userId: Joi.string().uuid().optional(),
  identifier: Joi.string().optional(),
  newPassword: Joi.string().min(8).max(128).pattern(passwordPattern).required().messages({
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords do not match'
  }),
  token: Joi.string().optional(),
  otp: Joi.string().length(6).pattern(/^\d{6}$/).optional()
}).custom((value, helpers) => {
  if (!value.token && !value.otp) {
    return helpers.error('any.custom', {
      message: 'Either token or otp must be provided'
    });
  }

  if (value.otp && !value.userId && !value.identifier) {
    return helpers.error('any.custom', {
      message: 'Either userId or identifier must be provided when using otp'
    });
  }

  return value;
}).messages({
  'any.custom': '{{#message}}'
});

const updateMeSchema = Joi.object({
  first_name: Joi.string().max(100).optional(),
  last_name: Joi.string().max(100).optional(),
  region: Joi.string().max(100).allow('', null).optional(),
  city: Joi.string().max(100).allow('', null).optional(),
  country: Joi.string().max(100).allow('', null).optional(),
  profile_image_url: Joi.string().uri().allow('', null).optional(),
  farm_name: Joi.string().max(200).allow('', null).optional(),
  cooperative_name: Joi.string().max(200).allow('', null).optional(),
  bio: Joi.string().max(2000).allow('', null).optional(),
  crops_grown: Joi.array().items(Joi.string().max(100)).optional(),
  primary_crop: Joi.string().max(120).allow('', null).optional(),
  harvest_volume: Joi.string().max(120).allow('', null).optional(),
  export_ready: Joi.boolean().optional(),
  inspection_preference: Joi.string().max(160).allow('', null).optional(),
  payout_method: Joi.string().max(120).allow('', null).optional(),
  payout_account_name: Joi.string().max(160).allow('', null).optional(),
  payout_phone: Joi.string().allow('', null).optional(),
  notification_opt_in: Joi.boolean().optional(),
  business_name: Joi.string().max(200).allow('', null).optional(),
  about: Joi.string().max(2000).allow('', null).optional(),
  crops_sold: Joi.array().items(Joi.string().max(100)).optional(),
  company_name: Joi.string().max(200).allow('', null).optional(),
  preferred_crops: Joi.array().items(Joi.string().max(100)).optional(),
  annual_import_volume: Joi.string().max(100).allow('', null).optional(),
  import_country: Joi.string().max(100).allow('', null).optional(),
  destination_market: Joi.string().max(160).allow('', null).optional()
}).min(1);

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).pattern(passwordPattern).required().messages({
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords do not match'
  })
});

const contactChangeRequestSchema = Joi.object({
  type: Joi.string().valid('email', 'phone').required(),
  value: Joi.string().required()
});

const contactChangeConfirmSchema = Joi.object({
  type: Joi.string().valid('email', 'phone').required(),
  value: Joi.string().optional(),
  token: Joi.string().optional(),
  otp: Joi.string().optional()
}).or('token', 'otp');

const recoveryContactSchema = Joi.object({
  type: Joi.string().valid('email', 'phone').required(),
  value: Joi.string().required()
});

const recoveryContactConfirmSchema = Joi.object({
  type: Joi.string().valid('email', 'phone').required(),
  value: Joi.string().required(),
  token: Joi.string().optional(),
  otp: Joi.string().optional()
}).or('token', 'otp');

module.exports = {
  registerFarmerSchema,
  registerResellerSchema,
  registerBuyerSchema,
  loginSchema,
  sendOtpSchema,
  confirmOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateMeSchema,
  changePasswordSchema,
  contactChangeRequestSchema,
  contactChangeConfirmSchema,
  recoveryContactSchema,
  recoveryContactConfirmSchema
};
