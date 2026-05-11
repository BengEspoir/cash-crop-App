import { z } from "zod";

const cameroonPhone = /^6[\d\s]{8,11}$/;
const farmerPhoneValidator = z.string().regex(cameroonPhone, "Enter a valid Cameroon phone number starting with 6.");
const emailSchema = z.string().email("Enter a valid email address.");
const passwordSchema = z.string()
  .min(8, "At least 8 characters")
  .regex(/[a-z]/, "One lowercase letter")
  .regex(/[A-Z]/, "One uppercase letter")
  .regex(/\d/, "One number");

// International phone validator - accepts 7-15 digits
const internationalPhone = /^[\d\s]{7,15}$/;
const cameroonNationalPhone = /^6\d{8}$/;

const stripPhone = (value = "") => String(value).replace(/\s+/g, "");

const validateFlexiblePhone = (value, ctx, path = ["phone"]) => {
  const cleanPhone = stripPhone(value);
  const isValidCameroon = cameroonPhone.test(cleanPhone);
  const isValidInternational = internationalPhone.test(cleanPhone);

  if (!isValidCameroon && !isValidInternational) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path,
      message: "Enter a valid phone number.",
    });
  }
};

const validateBuyerStepOne = (value, ctx) => {
  const cleanPhone = stripPhone(value.phone);
  const country = String(value.country || "").trim().toLowerCase();
  const countryCode = String(value.countryCode || "").trim().toUpperCase();

  if (value.password !== value.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["confirmPassword"],
      message: "Passwords do not match.",
    });
  }

  if (value.buyerType === "local") {
    if (!cameroonNationalPhone.test(cleanPhone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message: "Enter a valid Cameroon phone number starting with 6 (e.g., 6XX XXX XXX).",
      });
    }

    if (country !== "cameroon") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["country"],
        message: "Local buyers must register from Cameroon.",
      });
    }

    if (countryCode && countryCode !== "CM") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["countryCode"],
        message: "Local buyers must use country code CM.",
      });
    }

    return;
  }

  if (!countryCode) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["countryCode"],
      message: "Select the country code for this phone number.",
    });
  }

  if (country === "cameroon" || countryCode === "CM") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["country"],
      message: "Use Local Buyer for Cameroon registrations.",
    });
  }

  if (cameroonNationalPhone.test(cleanPhone)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["phone"],
      message: "Cameroon phone numbers are only allowed for local buyers.",
    });
  }

  if (cleanPhone.length < 7 || cleanPhone.length > 15) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["phone"],
      message: "Enter a valid phone number for your country.",
    });
  }
};

export const signInSchema = z.object({
  mode: z.enum(["phone", "email"]),
  phone: z.string().optional(),
  email: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters."),
}).superRefine((value, ctx) => {
  if (value.mode === "phone") {
    validateFlexiblePhone(value.phone, ctx);
  }

  if (value.mode === "email" && (!value.email || !emailSchema.safeParse(value.email).success)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["email"],
      message: "Enter a valid email address.",
    });
  }
});

export const forgotPasswordSchema = z.object({
  mode: z.enum(["phone", "email"]),
  phone: z.string().optional(),
  email: z.string().optional(),
}).superRefine((value, ctx) => {
  if (value.mode === "phone") {
    validateFlexiblePhone(value.phone, ctx);
  }

  if (value.mode === "email" && (!value.email || !emailSchema.safeParse(value.email).success)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["email"],
      message: "Enter a valid email address.",
    });
  }
});

export const resetPasswordSchema = z.object({
  code: z.string().optional(),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((value) => value.password === value.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match.",
});

export const verifyPhoneSchema = z.object({
  code: z.string().length(6, "Enter the 6-digit code."),
});

export const registerFarmerSchemas = [
  z.object({
    firstName: z.string().min(2, "First name is required."),
    lastName: z.string().min(2, "Last name is required."),
    phone: farmerPhoneValidator,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(8, "Confirm your password."),
    region: z.string().min(2, "Select your region."),
    city: z.string().min(2, "Enter your city or town."),
    acceptedTerms: z.boolean().refine(Boolean, "You must accept the terms."),
  }).refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  }),
  z.object({
    primaryCrop: z.string().min(2, "Choose a primary crop."),
    harvestVolume: z.string().min(2, "Enter your estimated harvest volume."),
    cooperative: z.string().min(2, "Enter your farm or cooperative name."),
    exportReady: z.boolean(),
    inspectionPreference: z.string().min(2, "Select an inspection preference."),
  }),
  z.object({
    payoutMethod: z.string().min(2, "Choose a payout method."),
    accountName: z.string().min(2, "Enter your account name."),
    payoutPhone: farmerPhoneValidator,
    notificationOptIn: z.boolean(),
  }),
];

// Unified schema for all steps combined - prevents data loss between steps
export const registerFarmerUnifiedSchema = z.object({
  // Step 1: Personal (Required on step 1)
  firstName: z.string().min(2, "First name is required."),
  lastName: z.string().min(2, "Last name is required."),
  phone: farmerPhoneValidator,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(8, "Confirm your password."),
  region: z.string().min(2, "Select your region."),
  city: z.string().min(2, "Enter your city or town."),
  acceptedTerms: z.boolean().refine(Boolean, "You must accept the terms."),
  
  // Step 2: Farm Details (Optional until step 2, then required)
  primaryCrop: z.string().optional(), // Will be validated when needed
  harvestVolume: z.string().optional(),
  cooperative: z.string().optional(),
  exportReady: z.boolean().optional(),
  inspectionPreference: z.string().optional(),
  
  // Step 3: Payout Setup (Optional until step 3, then required)
  payoutMethod: z.string().optional(),
  accountName: z.string().optional(),
  payoutPhone: z.string().optional(),
  notificationOptIn: z.boolean().optional(),
}).refine((value) => value.password === value.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match.",
});

export const registerBuyerSchemas = [
  z.object({
    buyerType: z.enum(["local", "international"]),
    companyName: z.string().min(2, "Enter your company or buyer name."),
    contactName: z.string().min(2, "Enter a contact name."),
    country: z.string().min(2, "Enter your country."),
    countryCode: z.string().optional(),
    phone: z.string(),
    email: z.string().email("Enter a valid email address."),
    password: passwordSchema,
    confirmPassword: z.string().min(8, "Confirm your password."),
    agreedToPolicy: z.boolean().refine(Boolean, "You must accept the buyer terms."),
  }).superRefine((value, ctx) => {
    validateBuyerStepOne(value, ctx);
  }),
];

// Unified schema for buyer registration - prevents data loss between steps
export const registerBuyerUnifiedSchema = z.object({
  // Step 1: Buyer Profile (Required on step 1)
  buyerType: z.enum(["local", "international"]),
  companyName: z.string().min(2, "Enter your company or buyer name."),
  contactName: z.string().min(2, "Enter a contact name."),
  country: z.string().min(2, "Enter your country."),
  countryCode: z.string().optional(),
  phone: z.string(), // Will be validated below
  email: z.string().email("Enter a valid email address."),
  password: passwordSchema,
  confirmPassword: z.string().min(8, "Confirm your password."),
  
  // Preferences are configured later in dashboard settings.
  buyingFocus: z.string().optional(),
  monthlyVolume: z.string().optional(),
  destination: z.string().optional(),
  agreedToPolicy: z.boolean().refine(Boolean, "You must accept the buyer terms."),
}).superRefine((value, ctx) => {
  validateBuyerStepOne(value, ctx);
});
