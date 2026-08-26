import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCreateListing, useDeleteListing, useUpdateListing } from "@/hooks/useListings";
import { useCreatePayment, useRequestWithdrawal } from "@/hooks/usePayments";
import { queryKeys } from "@/lib/queryKeys";

const api = vi.hoisted(() => ({
  delete: vi.fn(),
  patch: vi.fn(),
  post: vi.fn(),
}));

vi.mock("@/lib/axios", () => ({ default: api }));
vi.mock("@/hooks/useQueryUser", () => ({ useQueryUserId: () => "user-1" }));

function createHarness() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

async function executeMutation(hook, wrapper, variables) {
  const { result } = renderHook(hook, { wrapper });
  await act(async () => {
    await result.current.mutateAsync(variables);
  });
}

describe("mutation cache invalidation", () => {
  beforeEach(() => {
    api.delete.mockReset();
    api.patch.mockReset();
    api.post.mockReset();
  });

  it("refreshes listing collections, details, and farmer dashboard after creation", async () => {
    api.post.mockResolvedValue({ data: { data: { id: "listing-1" } } });
    const { queryClient, wrapper } = createHarness();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    await executeMutation(useCreateListing, wrapper, { crop: "Cocoa" });

    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.listings.all });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.listings.details });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.dashboard.role("farmer") });
  });

  it("refreshes listing detail and dashboard data after an update", async () => {
    api.patch.mockResolvedValue({ data: { data: { id: "listing-1" } } });
    const { queryClient, wrapper } = createHarness();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    await executeMutation(useUpdateListing, wrapper, {
      id: "listing-1",
      payload: { price: 2000 },
    });

    expect(api.patch).toHaveBeenCalledWith("/listings/listing-1", { price: 2000 });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.listings.details });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.dashboard.role("farmer") });
  });

  it("removes a deleted listing detail and refreshes its collections", async () => {
    api.delete.mockResolvedValue({ data: { data: { id: "listing-1" } } });
    const { queryClient, wrapper } = createHarness();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const remove = vi.spyOn(queryClient, "removeQueries");

    await executeMutation(useDeleteListing, wrapper, "listing-1");

    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.listings.all });
    expect(remove).toHaveBeenCalledWith(expect.objectContaining({ predicate: expect.any(Function) }));
    const [{ predicate }] = remove.mock.calls[0];
    expect(predicate({ queryKey: ["listing", "user-1", "listing-1"] })).toBe(true);
    expect(predicate({ queryKey: ["listing", "user-1", "listing-2"] })).toBe(false);
  });

  it("refreshes payments, orders, and dashboards after starting a payment", async () => {
    api.post.mockResolvedValue({ data: { data: { id: "payment-1" } } });
    const { queryClient, wrapper } = createHarness();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    await executeMutation(useCreatePayment, wrapper, { orderId: "order-1" });

    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.payments.list("user-1") });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.orders.all });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.dashboard.all });
  });

  it("refreshes the authenticated payment balance after a withdrawal request", async () => {
    api.post.mockResolvedValue({ data: { data: { id: "withdrawal-1" } } });
    const { queryClient, wrapper } = createHarness();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    await executeMutation(useRequestWithdrawal, wrapper);

    expect(api.post).toHaveBeenCalledWith("/payments/withdrawals");
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.payments.list("user-1") });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.dashboard.all });
  });
});
