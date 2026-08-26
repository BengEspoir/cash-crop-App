"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import useAuth from "@/hooks/useAuth";
import { useListing } from "@/hooks/useListings";
import { useOrders, useCreateOrder } from "@/hooks/useOrders";
import { useCreateCheckoutIntent } from "@/hooks/usePayments";
import { useEstimateLogistics } from "@/hooks/useLogistics";
import { useDashboardPreferences, useUpdateDashboardPreferences } from "@/hooks/useDashboardPreferences";
import { useCartStore } from "@/store/cartStore";

const createIdempotencyKey = () => globalThis.crypto?.randomUUID?.()
  || "00000000-0000-4000-8000-000000000000";

export function useBuyerCheckout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isBuyer } = useAuth();
  const cart = useCartStore((state) => state.item);
  const clearCart = useCartStore((state) => state.clearCart);
  const orderId = searchParams.get("orderId");
  const listingId = searchParams.get("listingId") || cart?.listing?.id || null;
  const { data: listing } = useListing(listingId);
  const { orders = [], isLoading } = useOrders();
  const createOrder = useCreateOrder();
  const createIntent = useCreateCheckoutIntent();
  const { data: preferences } = useDashboardPreferences();
  const updatePreferences = useUpdateDashboardPreferences();
  useEstimateLogistics({}, false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const createdOrderRef = useRef(null);
  const idempotencyKey = useRef(createIdempotencyKey());

  const existingOrder = useMemo(
    () => orders.find((candidate) => candidate.rawId === orderId || candidate.id === orderId) || null,
    [orderId, orders],
  );
  const order = existingOrder || createdOrder;

  const handleCheckout = async () => {
    if (!isAuthenticated || !isBuyer) {
      toast.error("Please sign in with a buyer account to continue.");
      return;
    }

    try {
      let liveOrder = existingOrder || createdOrderRef.current;
      if (!liveOrder) {
        const stagedListing = listing || cart?.listing;
        if (!stagedListing?.id) throw new Error("Choose a crop listing before checkout.");
        if (!cart?.shippingAddress?.trim()) throw new Error("Shipping address is required.");
        liveOrder = await createOrder.mutateAsync({
          listingId: stagedListing.id,
          quantity: Number(cart.quantity || 1),
          quantityUnit: stagedListing.quantityUnit || "kg",
          logisticsRequired: Boolean(cart.logisticsRequired),
          destinationRegion: cart.destinationRegion || user?.region || null,
          destinationCity: cart.destinationCity || user?.city || null,
          shippingAddress: cart.shippingAddress.trim(),
          billingAddress: cart.billingAddress?.trim() || null,
          notes: cart.notes?.trim() || null,
          idempotencyKey: idempotencyKey.current,
        });
        createdOrderRef.current = liveOrder;
        setCreatedOrder(liveOrder);
        router.replace(`/buyer/checkout?orderId=${liveOrder.rawId || liveOrder.id}`);
      }

      const channel = preferences?.preferences?.buyerCheckoutChannel || "mtn_momo";
      const intent = await createIntent.mutateAsync({
        orderId: liveOrder.rawId || liveOrder.id,
        channel,
        provider: "fapshi",
      });
      void Promise.resolve(
        updatePreferences.mutateAsync?.({ preferences: { buyerCheckoutChannel: channel } }),
      ).catch(() => {});
      if (intent?.checkoutUrl) {
        clearCart?.();
        window.location.assign(intent.checkoutUrl);
      } else if (intent?.message) {
        toast.error(intent.message);
      }
      return intent;
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Checkout could not be prepared.");
      return null;
    }
  };

  return {
    order,
    isLoading,
    isPending: createOrder.isPending || createIntent.isPending,
    handleCheckout,
  };
}
