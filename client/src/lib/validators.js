import { z } from "zod";

const cameroonPhone = /^6[\d\s]{8,11}$/;
const farmerPhoneValidator = z.string().regex(cameroonPhone, "Enter a valid Cameroon phone number starting with 6.");
const emailSchema = z.string().email("Enter a valid email address.");
const emailSchemaOptional = z.string().email("Enter a valid email address.").or(z.literal(""));
const passwordSchema = z.string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "One uppercase letter")
  .regex(/\d/, "One number");

export const signInSchema = z.object({
  mode: z.enum(["phone", "email"]),
  phone: z.string().optional(),
  email: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters."),
}).superRefine((value, ctx) => {
  if (value.mode === "phone" && !cameroonPhone.test((value.phone || "").replace(/\s+/g, ""))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["phone"],
      message: "Enter a valid Cameroon phone number.",
    });
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
  if (value.mode === "phone" && !cameroonPhone.test((value.phone || "").replace(/\s+/g, ""))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["phone"],
      message: "Enter a valid Cameroon phone number.",
    });
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
    email: emailSchemaOptional,
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
  email: emailSchemaOptional,
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
    phone: farmerPhoneValidator,
    email: z.string().email("Enter a valid email address."),
    password: passwordSchema,
    confirmPassword: z.string().min(8, "Confirm your password."),
  }).refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  }),
  z.object({
    buyingFocus: z.string().min(2, "Tell us what you source most often."),
    monthlyVolume: z.string().min(2, "Enter your target order volume."),
    destination: z.string().min(2, "Enter your destination market."),
    agreedToPolicy: z.boolean().refine(Boolean, "You must accept the buyer terms."),
  }),
];

// International phone validator - allows digits and spaces
const internationalPhoneValidator = z.string()
  .min(7, "Phone number is too short")
  .max(15, "Phone number is too long")
  .regex(/^[\d\s]+$/, "Phone number must contain only digits and spaces");

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
  
  // Step 2: Sourcing Preferences (Optional until step 2, then required)
  buyingFocus: z.string().optional(),
  monthlyVolume: z.string().optional(),
  destination: z.string().optional(),
  agreedToPolicy: z.boolean().optional(),
}).superRefine((value, ctx) => {
  // Password match validation
  if (value.password !== value.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["confirmPassword"],
      message: "Passwords do not match.",
    });
  }
  
  // Phone validation based on buyer type
  if (value.buyerType === "local") {
    // Local buyers must have Cameroon phone
    const cleanPhone = (value.phone || "").replace(/\s+/g, "");
    if (!/^6\d{8}$/.test(cleanPhone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message: "Enter a valid Cameroon phone number starting with 6 (e.g., 6XX XXX XXX).",
      });
    }
  } else {
    // International buyers
    const cleanPhone = (value.phone || "").replace(/\s+/g, "");
    if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message: "Enter a valid phone number for your country.",
      });
    }
  }
});
