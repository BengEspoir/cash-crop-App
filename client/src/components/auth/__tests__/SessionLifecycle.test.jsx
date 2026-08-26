import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SessionLifecycle } from "@/components/auth/SessionLifecycle";

const mocks = vi.hoisted(() => ({
  authChange: null,
  fetchMe: vi.fn(),
  hydrateSession: vi.fn(),
  setState: vi.fn(),
  unsubscribe: vi.fn(),
}));

vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    auth: {
      onAuthStateChange: (callback) => {
        mocks.authChange = callback;
        return { data: { subscription: { unsubscribe: mocks.unsubscribe } } };
      },
    },
  },
}));

vi.mock("@/store/authStore", () => ({
  default: {
    getState: () => ({ hydrateSession: mocks.hydrateSession, fetchMe: mocks.fetchMe }),
    setState: (...args) => mocks.setState(...args),
  },
}));

vi.mock("@/store/cartStore", () => ({
  useCartStore: { getState: () => ({ clearSensitiveCheckout: vi.fn() }) },
}));

function renderLifecycle() {
  const queryClient = new QueryClient();
  queryClient.setQueryData(["orders", "user-1"], [{ id: "order-1" }]);
  const clear = vi.spyOn(queryClient, "clear");
  render(
    <QueryClientProvider client={queryClient}>
      <SessionLifecycle />
    </QueryClientProvider>,
  );
  return { clear, queryClient };
}

describe("SessionLifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authChange = null;
  });

  it("hydrates from the Supabase session on mount", () => {
    renderLifecycle();
    expect(mocks.hydrateSession).toHaveBeenCalledTimes(1);
  });

  it("clears account-scoped cache when Supabase signs out", async () => {
    const { clear, queryClient } = renderLifecycle();
    act(() => mocks.authChange("SIGNED_OUT", null));
    await waitFor(() => expect(queryClient.getQueryCache().getAll()).toHaveLength(0));
    expect(clear).toHaveBeenCalledTimes(1);
    expect(mocks.setState).toHaveBeenCalledWith({ user: null, isAuthenticated: false });
  });

  it("refreshes the domain profile after a Supabase sign-in", () => {
    renderLifecycle();
    act(() => mocks.authChange("SIGNED_IN", { access_token: "token" }));
    expect(mocks.fetchMe).toHaveBeenCalledTimes(1);
  });
});
