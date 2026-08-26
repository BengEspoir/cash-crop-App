import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cart: null,
  createIntent: vi.fn(),
  createOrder: vi.fn(),
  listing: { id: "listing-1", quantityUnit: "kg", priceValue: 1000 },
  orders: [],
  query: {},
  replace: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: mocks.replace }),
  useSearchParams: () => ({ get: (key) => mocks.query[key] || null }),
}));
vi.mock("react-hot-toast", () => ({ default: { error: mocks.toastError } }));
vi.mock("@/hooks/useAuth", () => ({
  default: () => ({
    user: { id: "buyer-user", region: "Centre", city: "Yaounde" },
    isAuthenticated: true,
    isBuyer: true,
  }),
}));
vi.mock("@/hooks/useListings", () => ({
  useListing: () => ({ data: mocks.listing }),
}));
vi.mock("@/hooks/useOrders", () => ({
  useOrders: () => ({ orders: mocks.orders, isLoading: false }),
  useCreateOrder: () => ({ mutateAsync: mocks.createOrder, isPending: false }),
}));
vi.mock("@/hooks/usePayments", () => ({
  useCreateCheckoutIntent: () => ({ mutateAsync: mocks.createIntent, isPending: false }),
}));
vi.mock("@/hooks/useLogistics", () => ({
  useEstimateLogistics: () => ({ data: null }),
}));
vi.mock("@/hooks/useDashboardPreferences", () => ({
  useDashboardPreferences: () => ({ data: null }),
  useUpdateDashboardPreferences: () => ({ mutateAsync: vi.fn() }),
}));
vi.mock("@/store/cartStore", () => ({
  useCartStore: (selector) => selector({
    item: mocks.cart,
    setListing: vi.fn(),
    updateItem: vi.fn(),
    clearCart: vi.fn(),
  }),
}));

import { useBuyerCheckout } from "@/hooks/useBuyerCheckout";

describe("useBuyerCheckout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.query = {};
    mocks.orders = [];
    mocks.cart = {
      listing: { id: "listing-1", quantityUnit: "kg", priceValue: 1000 },
      quantity: 2,
      shippingAddress: "12 Market Road",
      billingAddress: "",
      notes: "",
      logisticsRequired: false,
      destinationRegion: "Centre",
      destinationCity: "Yaounde",
    };
  });

  it("reuses a newly created order when payment intent preparation fails", async () => {
    mocks.createOrder.mockResolvedValue({ rawId: "order-1", id: "ORD-1" });
    mocks.createIntent.mockRejectedValue(new Error("provider unavailable"));
    const { result } = renderHook(() => useBuyerCheckout());

    await act(async () => result.current.handleCheckout());
    await act(async () => result.current.handleCheckout());

    expect(mocks.createOrder).toHaveBeenCalledTimes(1);
    expect(mocks.createIntent).toHaveBeenCalledTimes(2);
    expect(mocks.replace).toHaveBeenCalledWith("/buyer/checkout?orderId=order-1");
    expect(result.current.order).toMatchObject({ rawId: "order-1" });
  });

  it("does not require shipping-address re-entry for an existing order", async () => {
    mocks.query = { orderId: "order-1" };
    mocks.orders = [{ rawId: "order-1", id: "ORD-1", amount: 5000, status: "pending_payment" }];
    mocks.cart = null;
    mocks.createIntent.mockResolvedValue({ message: "Continue later" });
    const { result } = renderHook(() => useBuyerCheckout());

    await act(async () => result.current.handleCheckout());

    expect(mocks.createOrder).not.toHaveBeenCalled();
    expect(mocks.createIntent).toHaveBeenCalledWith({
      orderId: "order-1",
      channel: "mtn_momo",
      provider: "fapshi",
    });
  });
});
