"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { AlertTriangle, CreditCard, MapPin, ShieldCheck, ShoppingCart } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { useListing } from "@/hooks/useListings";
import { useOrders, useCreateOrder } from "@/hooks/useOrders";
import { useCreateCheckoutIntent } from "@/hooks/usePayments";
import { useDashboardPreferences, useUpdateDashboardPreferences } from "@/hooks/useDashboardPreferences";
import { useCartStore } from "@/store/cartStore";
import { BuyerButton, BuyerEmptyState, BuyerPage, BuyerPanel, BuyerStatusBadge, compactBuyerCurrency } from "@/components/buyer/BuyerDesignSystem";
import { MediaAvatar } from "@/components/media/Avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VerificationBadge } from "@/components/farmers/VerificationBadge";

const PAYMENT_METHODS = [
  {
    value: "mtn_momo",
    label: "MTN MoMo",
    detail: "Instant checkout through the hosted Fapshi payment page.",
    badge: "Primary mobile money",
  },
  {
    value: "orange_money",
    label: "Orange Money",
    detail: "Use Orange Money on the same hosted Fapshi checkout.",
    badge: "Alternative mobile money",
  },
];

const buildInitialState = (cartItem, listing) => ({
  quantity: String(cartItem?.quantity || 1),
  shippingAddress: cartItem?.shippingAddress || "",
  billingAddress: cartItem?.billingAddress || "",
  notes: cartItem?.notes || "",
  quantityUnit: listing?.quantityUnit || cartItem?.listing?.quantityUnit || "kg",
  channel: "mtn_momo",
});

export default function BuyerCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isBuyer } = useAuth();
  const orderId = searchParams.get("orderId");
  const listingIdFromQuery = searchParams.get("listingId");
  const cartItem = useCartStore((state) => state.item);
  const setListing = useCartStore((state) => state.setListing);
  const updateItem = useCartStore((state) => state.updateItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const listingId = listingIdFromQuery || cartItem?.listing?.id || null;
  const { data: listing } = useListing(listingId);
  const { orders = [] } = useOrders();
  const createOrder = useCreateOrder();
  const createIntent = useCreateCheckoutIntent();
  const { data: preferencesData } = useDashboardPreferences();
  const updatePreferences = useUpdateDashboardPreferences();
  const [form, setForm] = useState(buildInitialState(cartItem, listing));

  useEffect(() => {
    if (listing && !cartItem?.listing?.id) {
      setListing(listing);
    }
  }, [cartItem?.listing?.id, listing, setListing]);

  useEffect(() => {
    const preferredChannel = preferencesData?.preferences?.buyerCheckoutChannel;
    setForm((current) => ({
      ...buildInitialState(cartItem, listing),
      channel: preferredChannel || current.channel || "mtn_momo",
    }));
  }, [cartItem, listing, preferencesData?.preferences?.buyerCheckoutChannel]);

  const order = useMemo(
    () => orders.find((item) => item.rawId === orderId || item.id === orderId),
    [orderId, orders],
  );

  const activeListing = order ? null : (listing || cartItem?.listing);
  const quantity = Number(form.quantity || 0);
  const unitPrice = order ? Number(order.amount || 0) / Math.max(Number(order.quantity?.split(" ")?.[0] || 1), 1) : Number(activeListing?.priceValue || 0);
  const totalAmount = order ? Number(order.amount || 0) : quantity * unitPrice;

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!isBuyer) {
      toast.error("Only buyer accounts can use checkout.");
      router.replace("/browse");
    }
  }, [isAuthenticated, isBuyer, router]);

  const update = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
    if (!order) {
      updateItem({ [field]: value, quantity: field === "quantity" ? Number(value || 1) : Number(form.quantity || 1) });
    }
  };

  const savePreference = async (channel) => {
    try {
      await updatePreferences.mutateAsync({ preferences: { buyerCheckoutChannel: channel } });
    } catch {
      // non-blocking
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated || !isBuyer) {
      toast.error("Please sign in with a buyer account to continue.");
      router.push("/sign-in");
      return;
    }

    if (!order && !activeListing?.id) {
      toast.error("Choose a crop listing before checkout.");
      return;
    }

    if (!order && (!quantity || quantity <= 0)) {
      toast.error("Enter a valid quantity.");
      return;
    }

    if (!form.shippingAddress.trim()) {
      toast.error("Shipping address is required.");
      return;
    }

    try {
      const liveOrder = order || await createOrder.mutateAsync({
        listingId: activeListing.id,
        quantity,
        quantityUnit: form.quantityUnit || activeListing.quantityUnit || "kg",
        shippingAddress: form.shippingAddress.trim(),
        billingAddress: form.billingAddress.trim() || null,
        notes: form.notes.trim() || null,
      });

      await savePreference(form.channel);

      const intent = await createIntent.mutateAsync({
        orderId: liveOrder.rawId || liveOrder.id,
        channel: form.channel,
        provider: "fapshi",
      });

      if (intent?.checkoutUrl) {
        clearCart();
        window.location.assign(intent.checkoutUrl);
        return;
      }

      toast.error(intent?.message || "Payment provider is not configured yet.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Checkout could not be prepared.");
    }
  };

  if (!isAuthenticated) {
    return (
      <BuyerPage>
        <BuyerEmptyState
          title="Buyer checkout requires sign-in"
          description="Sign in with a buyer account first, then return to complete payment."
          action={<BuyerButton href="/sign-in" variant="gold">Sign in</BuyerButton>}
        />
      </BuyerPage>
    );
  }

  if (!order && !activeListing) {
    return (
      <BuyerPage>
        <BuyerEmptyState
          title="No crop is staged for checkout"
          description="Add a listing to your cart from a crop detail page or pay an existing pending order."
          action={<BuyerButton href="/browse" icon={ShoppingCart}>Browse listings</BuyerButton>}
        />
      </BuyerPage>
    );
  }

  const seller = order?.seller || activeListing?.seller || activeListing?.farmer;

  return (
    <BuyerPage className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="section-eyebrow">Buyer checkout</p>
          <h1 className="font-display text-[30px] text-ink-950 sm:text-[36px]">Protected payment and order confirmation</h1>
          <p className="mt-2 max-w-3xl text-[16px] text-ink-500">
            AgriculNet keeps the payment protected in escrow until delivery and buyer confirmation are complete.
          </p>
        </div>
        <BuyerStatusBadge status={order ? order.status : "pending_payment"}>
          {order ? `Order ${order.id}` : "New checkout"}
        </BuyerStatusBadge>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="space-y-6">
          <BuyerPanel title="Order details">
            <div className="flex flex-col gap-5 rounded-2xl border border-green-200 bg-green-50/60 p-5 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-800 text-white">
                    <ShoppingCart className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-display text-[24px] text-green-950">{order?.crop || activeListing?.crop}</h2>
                    <p className="text-[15px] text-green-900/75">{order?.amountLabel || activeListing?.price}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {seller?.verificationStatus ? <VerificationBadge status={seller.verificationStatus} /> : null}
                  {activeListing?.exportReady || order?.seller?.exportReady ? <BuyerStatusBadge status="verified">Export-ready</BuyerStatusBadge> : null}
                </div>
                <p className="inline-flex items-center gap-2 text-[15px] text-ink-600">
                  <MapPin className="h-4 w-4" /> {seller?.location || activeListing?.location || "Cameroon"}
                </p>
              </div>
              <div className="rounded-2xl border border-green-200 bg-white px-4 py-3 text-right shadow-soft">
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-400">Protected amount</p>
                <p className="mt-2 font-display text-[28px] text-green-900">{compactBuyerCurrency(totalAmount)}</p>
              </div>
            </div>

            {!order ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-400">Quantity</span>
                  <Input type="number" min="1" value={form.quantity} onChange={update("quantity")} className="h-12" />
                </label>
                <label className="space-y-2">
                  <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-400">Unit</span>
                  <Input value={form.quantityUnit} onChange={update("quantityUnit")} className="h-12" />
                </label>
              </div>
            ) : null}

            <div className="mt-6 grid gap-4">
              <label className="space-y-2">
                <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-400">Shipping address</span>
                <Textarea rows={3} value={form.shippingAddress} onChange={update("shippingAddress")} placeholder="Delivery address or receiving warehouse" />
              </label>
              <label className="space-y-2">
                <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-400">Billing address</span>
                <Textarea rows={2} value={form.billingAddress} onChange={update("billingAddress")} placeholder="Optional billing address" />
              </label>
              <label className="space-y-2">
                <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-400">Order notes</span>
                <Textarea rows={4} value={form.notes} onChange={update("notes")} placeholder="Packing, dispatch, invoice, or inspection notes" />
              </label>
            </div>
          </BuyerPanel>

          <BuyerPanel title="Payment method">
            <div className="grid gap-4">
              {PAYMENT_METHODS.map((method) => {
                const active = form.channel === method.value;
                return (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, channel: method.value }))}
                    className={`rounded-2xl border p-5 text-left transition-all ${active ? "border-green-800 bg-green-50 shadow-soft" : "border-ink-200 bg-white hover:border-green-200"}`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-display text-[22px] text-ink-950">{method.label}</p>
                        <p className="mt-1 text-[15px] text-ink-500">{method.detail}</p>
                      </div>
                      <BuyerStatusBadge status={active ? "verified" : "pending"}>
                        {active ? "Selected" : method.badge}
                      </BuyerStatusBadge>
                    </div>
                  </button>
                );
              })}
            </div>
          </BuyerPanel>
        </div>

        <div className="space-y-6">
          <BuyerPanel title="Seller summary">
            <div className="flex items-center gap-4">
              <MediaAvatar
                src={seller?.avatarSrc}
                alt={seller?.name || "Seller"}
                initials={(seller?.name || "AG").slice(0, 2).toUpperCase()}
                size="lg"
                className="h-16 w-16 text-[20px]"
              />
              <div>
                <h2 className="font-display text-[22px] text-ink-950">{seller?.name || "Verified supplier"}</h2>
                <p className="text-[15px] text-ink-500">{seller?.contactName || seller?.location || "Cameroon"}</p>
              </div>
            </div>
            <div className="mt-5 space-y-3 rounded-2xl border border-ink-100 bg-ink-50 p-4">
              <p className="flex items-start gap-3 text-[14px] text-ink-600">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-green-800" />
                Payment is recorded in AgriculNet escrow and only released after order completion.
              </p>
              <p className="flex items-start gap-3 text-[14px] text-ink-600">
                <CreditCard className="mt-0.5 h-4 w-4 text-green-800" />
                Fapshi checkout lets the buyer choose MTN MoMo or Orange Money on the hosted payment page.
              </p>
            </div>
          </BuyerPanel>

          <BuyerPanel title="Checkout summary">
            <div className="space-y-4 text-[15px] text-ink-600">
              <div className="flex items-center justify-between gap-4">
                <span>Subtotal</span>
                <span className="font-semibold text-ink-950">{compactBuyerCurrency(totalAmount)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Payment channel</span>
                <span className="font-semibold text-ink-950">{PAYMENT_METHODS.find((item) => item.value === form.channel)?.label || "MTN MoMo"}</span>
              </div>
              <div className="rounded-2xl border border-gold-200 bg-gold-50 px-4 py-3 text-[14px] text-gold-900">
                <p className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4" />
                  Do not close the browser immediately after paying. AgriculNet waits for the Fapshi webhook before confirming the payment.
                </p>
              </div>
              <BuyerButton
                type="button"
                variant="gold"
                className="w-full"
                disabled={createOrder.isPending || createIntent.isPending}
                onClick={handleCheckout}
              >
                {createOrder.isPending || createIntent.isPending ? "Preparing checkout..." : "Continue to protected payment"}
              </BuyerButton>
              <BuyerButton href={order ? `/buyer/orders/${order.rawId || order.id}` : "/browse"} variant="outline" className="w-full">
                {order ? "Back to order" : "Return to marketplace"}
              </BuyerButton>
            </div>
          </BuyerPanel>
        </div>
      </div>
    </BuyerPage>
  );
}
