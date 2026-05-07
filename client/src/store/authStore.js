import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/axios";
import { maskIdentifier, normalizeCameroonPhone } from "@/lib/formatters";

const onboardingStorageKey = "agriculnet-onboarding";
const normalizeAuthIdentifier = (identifier = "") => {
  const normalized = String(identifier).trim();

  if (!normalized) {
    return normalized;
  }

  if (normalized.includes("@") || normalized.startsWith("+")) {
    return normalized;
  }

  return normalizeCameroonPhone(normalized);
};

const readOnboardingState = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.sessionStorage.getItem(onboardingStorageKey);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch {
    return null;
  }
};

const writeOnboardingState = (value) => {
  if (typeof window === "undefined") {
    return;
  }

  if (!value) {
    window.sessionStorage.removeItem(onboardingStorageKey);
    return;
  }

  window.sessionStorage.setItem(onboardingStorageKey, JSON.stringify(value));
};

const getErrorPayload = (error, fallbackMessage) => {
  const response = error.response?.data;
  const details = response?.error?.details;
  const deliveryMessage = details?.smsDelivery?.message || details?.emailDelivery?.message;

  return {
    success: false,
    error: deliveryMessage || response?.message || fallbackMessage,
    errorCode: response?.error?.code,
    details,
  };
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      onboarding: null,

      syncOnboarding: () => {
        set({ onboarding: readOnboardingState() });
      },

      setOnboarding: (payload) => {
        const nextOnboarding = {
          ...(get().onboarding || {}),
          ...payload,
        };

        writeOnboardingState(nextOnboarding);
        set({ onboarding: nextOnboarding });
        return nextOnboarding;
      },

      clearOnboarding: () => {
        writeOnboardingState(null);
        set({ onboarding: null });
      },

      setTokens: (accessToken, refreshToken) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("agriculnet_access_token", accessToken);
          localStorage.setItem("agriculnet_refresh_token", refreshToken);
        }

        set({ accessToken, refreshToken, isAuthenticated: true });
      },

      setUser: (user) => set({ user }),

      hydrateSession: async () => {
        const accessToken = typeof window !== "undefined"
          ? localStorage.getItem("agriculnet_access_token")
          : null;

        if (!accessToken) {
          set({ isAuthenticated: false, user: null });
          return { success: false };
        }

        return get().fetchMe();
      },

      login: async (identifier, password, rememberMe = false) => {
        set({ isLoading: true });

        try {
          const formattedIdentifier = normalizeAuthIdentifier(identifier);

          const { data } = await api.post("/auth/login", {
            identifier: formattedIdentifier,
            password,
            rememberMe,
          });

          const { accessToken, refreshToken, user } = data.data;
          get().setTokens(accessToken, refreshToken);
          if (data.data.nextStep && data.data.nextStep !== "dashboard") {
            get().setOnboarding({
              userId: user.id,
              role: user.role,
              phone: data.data.phone,
              email: data.data.email,
              identifier: formattedIdentifier,
              nextStep: data.data.nextStep,
              devHints: data.data.devHints || null,
            });
          } else {
            get().clearOnboarding();
          }
          set({ user, isLoading: false, isAuthenticated: true });
          return { success: true, data: data.data };
        } catch (error) {
          const payload = getErrorPayload(error, "Login failed");
          const details = payload.details;

          if (payload.errorCode === "PHONE_NOT_VERIFIED" && details?.userId) {
            get().setOnboarding({
              userId: details.userId,
              role: details.role,
              phone: details.phone,
              email: details.email,
              identifier,
              nextStep: details.nextStep,
              devHints: details.devHints || null,
            });
          }

          set({ isLoading: false });
          return payload;
        }
      },

      logout: async () => {
        try {
          const refreshToken = typeof window !== "undefined"
            ? localStorage.getItem("agriculnet_refresh_token")
            : null;

          if (refreshToken) {
            await api.post("/auth/logout", { refreshToken });
          }
        } finally {
          if (typeof window !== "undefined") {
            localStorage.removeItem("agriculnet_access_token");
            localStorage.removeItem("agriculnet_refresh_token");
          }

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
        }
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get("/auth/me");
          set({ user: data.data.user, isAuthenticated: true });
          return { success: true, data: data.data };
        } catch (error) {
          get().clearAuth();
          return {
            success: false,
            error: error.response?.data?.message || "Failed to fetch profile",
          };
        }
      },

      registerFarmer: async (farmerData) => {
        set({ isLoading: true });

        try {
          const payload = {
            ...farmerData,
            phone: normalizeCameroonPhone(farmerData.phone),
            payoutPhone: normalizeCameroonPhone(farmerData.payoutPhone),
          };

          const { data } = await api.post("/auth/register/farmer", payload);
          get().setOnboarding({
            userId: data.data.user.id,
            role: data.data.user.role,
            phone: data.data.phone,
            email: data.data.user.email ? maskIdentifier(data.data.user.email) : null,
            identifier: data.data.user.email || normalizeCameroonPhone(farmerData.phone),
            nextStep: data.data.nextStep,
            emailDelivery: data.data.emailDelivery || null,
            smsDelivery: data.data.smsDelivery || null,
            devHints: data.data.devHints || null,
          });

          set({ isLoading: false });
          return { success: true, data: data.data };
        } catch (error) {
          set({ isLoading: false });
          return getErrorPayload(error, "Registration failed");
        }
      },

      registerBuyer: async (buyerData) => {
        set({ isLoading: true });

        try {
          // Prepare payload with proper phone formatting
          const payload = { ...buyerData };
          
          // For local buyers, use Cameroon phone normalization
          // For international buyers, keep as-is (server will handle)
          if (buyerData.buyerType === "local") {
            payload.phone = normalizeCameroonPhone(buyerData.phone);
          }

          const { data } = await api.post("/auth/register/buyer", payload);
          get().setOnboarding({
            userId: data.data.user.id,
            role: data.data.user.role,
            phone: data.data.phone,
            email: maskIdentifier(data.data.user.email),
            identifier: data.data.user.email,
            nextStep: data.data.nextStep,
            emailDelivery: data.data.emailDelivery || null,
            smsDelivery: data.data.smsDelivery || null,
            devHints: data.data.devHints || null,
          });

          set({ isLoading: false });
          return { success: true, data: data.data };
        } catch (error) {
          set({ isLoading: false });
          return getErrorPayload(error, "Registration failed");
        }
      },

      verifyPhone: async (userId, otp) => {
        try {
          const { data } = await api.post("/auth/verify-phone/confirm", {
            userId,
            otp,
          });

          if (data.data.accessToken && data.data.refreshToken) {
            get().setTokens(data.data.accessToken, data.data.refreshToken);
            set({ user: data.data.user, isAuthenticated: true });
          }

          if (data.data.nextStep === "dashboard") {
            get().clearOnboarding();
          } else {
          get().setOnboarding({
            userId,
            role: data.data.user?.role || get().onboarding?.role,
            nextStep: data.data.nextStep,
            emailDelivery: data.data.emailDelivery || get().onboarding?.emailDelivery || null,
            smsDelivery: data.data.smsDelivery || get().onboarding?.smsDelivery || null,
          });
          }

          return { success: true, data: data.data };
        } catch (error) {
          return getErrorPayload(error, "Verification failed");
        }
      },

      verifyEmail: async (token) => {
        try {
          const { data } = await api.post("/auth/verify-email", { token });

          if (data.data.accessToken && data.data.refreshToken) {
            get().setTokens(data.data.accessToken, data.data.refreshToken);
            set({ user: data.data.user, isAuthenticated: true });
          }

          if (data.data.nextStep === "dashboard" || data.data.nextStep === "sign_in") {
            get().clearOnboarding();
          } else {
            get().setOnboarding({
              userId: data.data.user?.id || get().onboarding?.userId,
              role: data.data.user?.role || get().onboarding?.role,
              phone: data.data.phone || get().onboarding?.phone,
              email: data.data.email || get().onboarding?.email,
              nextStep: data.data.nextStep,
              emailDelivery: data.data.emailDelivery || get().onboarding?.emailDelivery || null,
              smsDelivery: data.data.smsDelivery || get().onboarding?.smsDelivery || null,
            });
          }

          return { success: true, data: data.data };
        } catch (error) {
          return getErrorPayload(error, "Email verification failed");
        }
      },

      resendVerification: async (type = "phone") => {
        const onboarding = get().onboarding;
        const user = get().user;
        const userId = onboarding?.userId || user?.id;

        if (!userId) {
          return {
            success: false,
            error: "No onboarding session is available.",
          };
        }

        try {
          const { data } = await api.post("/auth/resend-verification", {
            userId,
            type,
          });

          get().setOnboarding({
            userId,
            role: onboarding?.role || user?.role,
            phone: onboarding?.phone || data.data.phone || user?.phone,
            email: onboarding?.email || data.data.email || user?.email,
            emailDelivery: data.data.emailDelivery || onboarding?.emailDelivery || null,
            smsDelivery: data.data.smsDelivery || onboarding?.smsDelivery || null,
            devHints: data.data.devHints || null,
            nextStep: data.data.nextStep || onboarding?.nextStep,
          });

          return { success: true, data: data.data };
        } catch (error) {
          return getErrorPayload(error, "Failed to resend verification");
        }
      },

      forgotPassword: async ({ identifier, method }) => {
        try {
          const formattedIdentifier = method === "email"
            ? identifier
            : normalizeAuthIdentifier(identifier);

          const { data } = await api.post("/auth/forgot-password", {
            identifier: formattedIdentifier,
            method,
          });

          get().setOnboarding({
            identifier: formattedIdentifier,
            recoveryMethod: method,
            nextStep: data.data.nextStep,
            emailDelivery: data.data.emailDelivery || null,
            smsDelivery: data.data.smsDelivery || null,
            devHints: data.data.devHints || null,
          });

          return { success: true, data: data.data };
        } catch (error) {
          return getErrorPayload(error, "Failed to send reset option");
        }
      },

      resetPassword: async ({ password, confirmPassword, code, token }) => {
        const onboarding = get().onboarding;
        const payload = {
          newPassword: password,
          confirmPassword,
        };

        if (token) {
          payload.token = token;
        } else {
          payload.otp = code;
          payload.identifier = onboarding?.identifier?.includes("@")
            ? onboarding.identifier
            : normalizeAuthIdentifier(onboarding?.identifier || "");
        }

        try {
          const { data } = await api.post("/auth/reset-password", payload);
          get().clearOnboarding();
          return { success: true, data: data.data };
        } catch (error) {
          return getErrorPayload(error, "Password reset failed");
        }
      },

      sendOtp: async (userId, purpose = "phone_verification") => {
        try {
          const { data } = await api.post("/auth/verify-phone/send", { userId, purpose });
          get().setOnboarding({
            smsDelivery: data.data.smsDelivery || null,
            devHints: data.data.devHints || null,
          });
          return { success: true, data: data.data };
        } catch (error) {
          return getErrorPayload(error, "Failed to send OTP");
        }
      },

      clearAuth: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("agriculnet_access_token");
          localStorage.removeItem("agriculnet_refresh_token");
        }

        get().clearOnboarding();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "agriculnet-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.syncOnboarding();
      },
    },
  ),
);

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    onboarding,
    login,
    logout,
    fetchMe,
    hydrateSession,
    registerFarmer,
    registerBuyer,
    verifyPhone,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    sendOtp,
    clearAuth,
    clearOnboarding,
    syncOnboarding,
  } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    onboarding,
    login,
    logout,
    fetchMe,
    hydrateSession,
    registerFarmer,
    registerBuyer,
    verifyPhone,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    sendOtp,
    clearAuth,
    clearOnboarding,
    syncOnboarding,
  };
};

export default useAuthStore;
