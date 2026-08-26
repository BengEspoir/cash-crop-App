import { StrictMode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDashboardAccess } from "@/hooks/useDashboardAccess";

const mocks = vi.hoisted(() => ({
  auth: null,
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock("@/hooks/useAuth", () => ({
  default: () => mocks.auth,
}));

const strictModeWrapper = ({ children }) => <StrictMode>{children}</StrictMode>;

function createAuth(overrides = {}) {
  return {
    clearAuth: vi.fn(),
    hydrateSession: vi.fn().mockResolvedValue({ success: true }),
    logout: vi.fn().mockResolvedValue(undefined),
    redirectToDashboard: vi.fn(() => "/buyer/dashboard"),
    user: {
      id: "buyer-1",
      role: "local_buyer",
      email_verified: true,
    },
    ...overrides,
  };
}

describe("useDashboardAccess", () => {
  beforeEach(() => {
    mocks.replace.mockReset();
    mocks.auth = createAuth();
  });

  it("hydrates exactly once and becomes ready under React Strict Mode", async () => {
    mocks.auth = createAuth({ user: null });
    const { result } = renderHook(
      () => useDashboardAccess({
        allowedRoles: ["local_buyer", "international_buyer"],
        authRedirect: "/auth/login",
        pathname: "/buyer/dashboard",
      }),
      { wrapper: strictModeWrapper },
    );

    await waitFor(() => expect(result.current.ready).toBe(true));

    expect(mocks.auth.hydrateSession).toHaveBeenCalledTimes(1);
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("clears stale state and redirects when no session exists", async () => {
    mocks.auth = createAuth({
      user: null,
      hydrateSession: vi.fn().mockResolvedValue({ success: false }),
    });

    renderHook(() => useDashboardAccess({
      allowedRoles: ["admin"],
      authRedirect: "/auth/login",
      pathname: "/admin/dashboard",
    }));

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/auth/login"));
    expect(mocks.auth.clearAuth).toHaveBeenCalledTimes(1);
    expect(mocks.auth.hydrateSession).toHaveBeenCalledTimes(1);
  });

  it("sends an authenticated user with the wrong role to their own dashboard", async () => {
    renderHook(() => useDashboardAccess({
      allowedRoles: ["admin", "super_admin"],
      authRedirect: "/admin-portal",
      pathname: "/admin/dashboard",
    }));

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/buyer/dashboard"));
  });

  it("routes an unverified account to its next authentication step", async () => {
    mocks.auth = createAuth({
      redirectToDashboard: vi.fn(() => "/verify-email"),
      user: {
        id: "farmer-1",
        role: "farmer",
        email_verified: false,
      },
    });

    renderHook(() => useDashboardAccess({
      allowedRoles: ["farmer"],
      authRedirect: "/auth/login",
      pathname: "/farmer/dashboard",
    }));

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/verify-email"));
  });
});
