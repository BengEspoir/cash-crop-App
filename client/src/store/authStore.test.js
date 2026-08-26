import { beforeEach, describe, expect, it, vi } from "vitest";
import useAuthStore from "@/store/authStore";
import api from "@/lib/axios";

const mocks = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  setSession: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@/lib/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args) => mocks.signInWithPassword(...args),
      setSession: (...args) => mocks.setSession(...args),
      signOut: (...args) => mocks.signOut(...args),
    },
  },
}));

describe("authStore login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ isLoading: false, user: null, isAuthenticated: false, onboarding: null });
  });

  it("normalizes the email and shows a safe message for a rejected password grant", async () => {
    mocks.signInWithPassword.mockResolvedValue({
      error: {
        code: "invalid_credentials",
        status: 400,
        message: "Invalid login credentials",
      },
    });

    const result = await useAuthStore.getState().login("  Admin@Example.COM ", "wrong-password");

    expect(mocks.signInWithPassword).toHaveBeenCalledOnce();
    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: "admin@example.com",
      password: "wrong-password",
    });
    expect(result).toEqual({
      success: false,
      error: "The email or password is incorrect. Check your details and try again.",
      errorCode: "invalid_credentials",
    });
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it("exchanges a Cameroon phone login for a Supabase session", async () => {
    api.post.mockResolvedValue({
      data: {
        data: {
          session: {
            accessToken: "access-token",
            refreshToken: "refresh-token",
          },
        },
      },
    });
    mocks.setSession.mockResolvedValue({ error: null });
    api.get.mockResolvedValue({
      data: {
        data: {
          user: {
            id: "user-1",
            role: "local_buyer",
            email_verified: true,
            phone_verified: false,
          },
        },
      },
    });

    const result = await useAuthStore.getState().login("699 123 456", "ValidPass1", "phone");

    expect(api.post).toHaveBeenCalledWith("/auth/login/phone", {
      phone: "+237699123456",
      password: "ValidPass1",
    });
    expect(mocks.setSession).toHaveBeenCalledWith({
      access_token: "access-token",
      refresh_token: "refresh-token",
    });
    expect(result.data.nextStep).toBe("dashboard");
  });

  it("sends phone verification for an authenticated user after onboarding state is cleared", async () => {
    useAuthStore.setState({
      user: {
        id: "buyer-1",
        role: "local_buyer",
        phone: "+237600000000",
        email_verified: true,
        phone_verified: false,
      },
      isAuthenticated: true,
      onboarding: null,
    });
    api.post.mockResolvedValue({
      data: {
        data: {
          phone: "+2376******00",
          smsDelivery: { status: "test-phone", provider: "test-phone", delivered: false },
          devHints: { otpCode: "123456" },
        },
      },
    });

    const result = await useAuthStore.getState().resendVerification("phone");

    expect(api.post).toHaveBeenCalledWith("/auth/verify-phone/send", {
      userId: "buyer-1",
      purpose: "phone_verification",
    });
    expect(result.success).toBe(true);
    expect(useAuthStore.getState().onboarding.smsDelivery.status).toBe("test-phone");
  });
});
