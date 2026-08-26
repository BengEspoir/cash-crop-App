import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/axios";
import { supabase } from "@/lib/supabaseClient";
import { maskIdentifier, normalizeCameroonPhone } from "@/lib/formatters";
import { formatPhoneInternational } from "@/lib/countries";

const onboardingStorageKey = "agriculnet-onboarding";

const readOnboardingState = () => {
  if (typeof window === "undefined") return null;
  try {
    const rawValue = window.sessionStorage.getItem(onboardingStorageKey);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch {
    return null;
  }
};

const writeOnboardingState = (value) => {
  if (typeof window === "undefined") return;
  if (value) window.sessionStorage.setItem(onboardingStorageKey, JSON.stringify(value));
  else window.sessionStorage.removeItem(onboardingStorageKey);
};

const errorResult = (error, fallback) => ({
  success: false,
  error: error?.response?.data?.message || error?.message || fallback,
  errorCode: error?.code || error?.response?.data?.error?.code,
  details: error?.response?.data?.error?.details,
});

const loginErrorResult = (error) => {
  const code = error?.code;
  let message = "We could not sign you in. Please try again.";

  if (code === "invalid_credentials") {
    message = "The email or password is incorrect. Check your details and try again.";
  } else if (code === "email_not_confirmed") {
    message = "Confirm your email address before signing in.";
  } else if (code === "over_request_rate_limit") {
    message = "Too many sign-in attempts. Wait a moment and try again.";
  } else if (error?.message === "Use your verified email address to sign in.") {
    message = error.message;
  } else if (error?.status === 400) {
    message = "The email or password is incorrect. Check your details and try again.";
  }

  return {
    success: false,
    error: message,
    errorCode: code,
  };
};

const roleForBuyer = (buyerType) => buyerType === "international"
  ? "international_buyer"
  : "local_buyer";

const getNextStepForUser = (user) => {
  if (!user?.email_verified) return "verify_email";
  if (["farmer", "reseller"].includes(user?.role) && user?.status === "pending_identity_verification") {
    return "verify_identity";
  }
  if (["farmer", "reseller"].includes(user?.role) && user?.status === "pending_review") {
    return "pending_review";
  }
  return "dashboard";
};

const getRegistrationNames = (values) => {
  if (values.firstName && values.lastName) {
    return { firstName: values.firstName, lastName: values.lastName };
  }
  const [firstName = "Buyer", ...rest] = String(values.contactName || "").trim().split(/\s+/).filter(Boolean);
  return { firstName, lastName: rest.join(" ") || "Buyer" };
};

const profileForRole = (role, values) => {
  const common = {
    first_name: values.firstName,
    last_name: values.lastName,
    country: values.country || "Cameroon",
    region: values.region,
    city: values.city,
  };

  if (role === "farmer") {
    return {
      ...common,
      cooperative_name: values.cooperative,
      primary_crop: values.primaryCrop,
      crops_grown: values.cropsGrown || [],
      harvest_volume: values.harvestVolume,
      export_ready: values.exportReady,
      inspection_preference: values.inspectionPreference,
      payout_method: values.payoutMethod,
      payout_account_name: values.accountName,
      payout_phone: values.payoutPhone ? normalizeCameroonPhone(values.payoutPhone) : undefined,
      notification_opt_in: values.notificationOptIn,
    };
  }

  if (role === "reseller") {
    return {
      ...common,
      business_name: values.businessName,
      primary_crop: values.primaryCrop,
      crops_sold: values.cropsSold || [],
      about: values.about,
      payout_method: values.payoutMethod,
      payout_account_name: values.accountName,
      payout_phone: values.payoutPhone ? normalizeCameroonPhone(values.payoutPhone) : undefined,
      notification_opt_in: values.notificationOptIn,
    };
  }

  return {
    ...common,
    company_name: values.companyName,
    preferred_crops: values.preferredCrops,
    annual_import_volume: values.annualImportVolume,
    import_country: values.importCountry,
    destination_market: values.destinationMarket,
  };
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      onboarding: null,

      syncOnboarding: () => set({ onboarding: readOnboardingState() }),

      setOnboarding: (payload) => {
        const next = { ...(get().onboarding || {}), ...payload };
        writeOnboardingState(next);
        set({ onboarding: next });
        return next;
      },

      clearOnboarding: () => {
        writeOnboardingState(null);
        set({ onboarding: null });
      },

      setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),

      fetchMe: async () => {
        try {
          const { data } = await api.get("/auth/me");
          const user = data.data.user;
          const pendingProfile = get().onboarding?.pendingProfile;
          if (pendingProfile) {
            await api.patch("/auth/me", pendingProfile);
            get().setOnboarding({ pendingProfile: null });
          }
          set({ user, isAuthenticated: true });
          return { success: true, data: { ...data.data, user } };
        } catch (error) {
          set({ user: null, isAuthenticated: false });
          return errorResult(error, "Failed to fetch profile");
        }
      },

      hydrateSession: async () => {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          set({ user: null, isAuthenticated: false });
          return { success: false, error: error?.message };
        }
        return get().fetchMe();
      },

      login: async (identifier, password, mode = "email") => {
        set({ isLoading: true });
        try {
          if (mode === "phone") {
            const phone = normalizeCameroonPhone(identifier);
            const response = await api.post("/auth/login/phone", { phone, password });
            const authData = response.data.data;
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: authData.session.accessToken,
              refresh_token: authData.session.refreshToken,
            });
            if (sessionError) throw sessionError;
          } else {
            const email = String(identifier).trim().toLowerCase();
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
          }

          const result = await get().fetchMe();
          set({ isLoading: false });
          if (!result.success) {
            await supabase.auth.signOut();
            return result;
          }
          get().clearOnboarding();
          return {
            success: true,
            data: { user: result.data.user, nextStep: getNextStepForUser(result.data.user) },
          };
        } catch (error) {
          set({ isLoading: false });
          return error?.response ? errorResult(error, "We could not sign you in.") : loginErrorResult(error);
        }
      },

      logout: async () => {
        await supabase.auth.signOut();
        writeOnboardingState(null);
        set({ user: null, isAuthenticated: false, onboarding: null });
      },

      register: async (role, values) => {
        set({ isLoading: true });
        try {
          const names = getRegistrationNames(values);
          const email = String(values.email || "").trim().toLowerCase();
          const phone = values.phone
            ? formatPhoneInternational(values.phone, values.countryCode || "CM")
            : null;
          const { data, error } = await supabase.auth.signUp({
            email,
            password: values.password,
            options: {
              emailRedirectTo: `${window.location.origin}/oauth/callback?flow=email-verification`,
              data: {
                requested_role: role,
                first_name: names.firstName,
                last_name: names.lastName,
                phone,
                country: values.country || "Cameroon",
              },
            },
          });
          if (error) throw error;

          const user = {
            id: data.user?.id,
            role,
            email,
            phone,
            email_verified: Boolean(data.user?.email_confirmed_at),
            phone_verified: false,
            status: "pending_verification",
          };
          const nextStep = data.session ? getNextStepForUser(user) : "verify_email";
          get().setOnboarding({
            userId: data.user?.id,
            role,
            email: maskIdentifier(email),
            identifier: email,
            phone,
            nextStep,
            pendingProfile: profileForRole(role, values),
          });

          if (data.session) await get().fetchMe();
          set({ isLoading: false });
          return {
            success: true,
            data: {
              user,
              email: maskIdentifier(email),
              phone,
              nextStep,
              emailDelivery: { status: "queued" },
            },
          };
        } catch (error) {
          set({ isLoading: false });
          return errorResult(error, "Registration failed");
        }
      },

      registerFarmer: (values) => get().register("farmer", values),
      registerReseller: (values) => get().register("reseller", values),
      registerBuyer: (values) => get().register(roleForBuyer(values.buyerType), values),

      verifyPhone: async (userId, otp) => {
        try {
          const { data } = await api.post("/auth/verify-phone/confirm", { userId, otp });
          if (data.data.nextStep === "dashboard") get().clearOnboarding();
          else get().setOnboarding({ nextStep: data.data.nextStep });
          await get().hydrateSession();
          return { success: true, data: data.data };
        } catch (error) {
          return errorResult(error, "Verification failed");
        }
      },

      verifyEmail: async (token) => {
        try {
          let exchange = await supabase.auth.exchangeCodeForSession(token);
          if (exchange.error) {
            exchange = await supabase.auth.verifyOtp({ token_hash: token, type: "email" });
          }
          if (exchange.error) throw exchange.error;
          const me = await get().fetchMe();
          if (!me.success) return me;
          const nextStep = getNextStepForUser(me.data.user);
          if (nextStep === "dashboard") get().clearOnboarding();
          else get().setOnboarding({ nextStep });
          return { success: true, data: { user: me.data.user, nextStep } };
        } catch (error) {
          return errorResult(error, "Email verification failed");
        }
      },

      resendVerification: async (type = "email", requestedUserId) => {
        try {
          if (type === "phone") {
            const userId = requestedUserId || get().onboarding?.userId || get().user?.id;
            return get().sendOtp(userId);
          }
          const email = get().onboarding?.identifier;
          if (!email?.includes("@")) throw new Error("No registration email is available.");
          const { error } = await supabase.auth.resend({
            type: "signup",
            email,
            options: { emailRedirectTo: `${window.location.origin}/oauth/callback?flow=email-verification` },
          });
          if (error) throw error;
          return { success: true, data: { nextStep: "verify_email", emailDelivery: { status: "queued" } } };
        } catch (error) {
          return errorResult(error, "Failed to resend verification");
        }
      },

      forgotPassword: async ({ identifier }) => {
        try {
          const email = String(identifier || "").trim().toLowerCase();
          if (!email.includes("@")) throw new Error("Password recovery requires your verified email address.");
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          });
          if (error) throw error;
          get().setOnboarding({ identifier: email, recoveryMethod: "email", nextStep: "reset_password" });
          return { success: true, data: { nextStep: "reset_password", emailDelivery: { status: "queued" } } };
        } catch (error) {
          return errorResult(error, "Failed to send password reset email");
        }
      },

      resetPassword: async ({ password, confirmPassword, code }) => {
        try {
          if (password !== confirmPassword) throw new Error("Passwords do not match");
          if (code) {
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) throw exchangeError;
          }
          const { error } = await supabase.auth.updateUser({ password });
          if (error) throw error;
          get().clearOnboarding();
          return { success: true, data: { nextStep: "sign_in" } };
        } catch (error) {
          return errorResult(error, "Password reset failed");
        }
      },

      sendOtp: async (userId, purpose = "phone_verification") => {
        try {
          if (!userId) throw new Error("No onboarding user is available.");
          const { data } = await api.post("/auth/verify-phone/send", { userId, purpose });
          get().setOnboarding({ smsDelivery: data.data.smsDelivery || null, devHints: data.data.devHints || null });
          return { success: true, data: data.data };
        } catch (error) {
          return errorResult(error, "Failed to send OTP");
        }
      },

      clearAuth: async () => {
        await supabase.auth.signOut();
        writeOnboardingState(null);
        set({ user: null, isAuthenticated: false, onboarding: null });
      },
    }),
    {
      name: "agriculnet-auth",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => state?.syncOnboarding(),
    },
  ),
);

export const useAuth = () => useAuthStore();
export default useAuthStore;
