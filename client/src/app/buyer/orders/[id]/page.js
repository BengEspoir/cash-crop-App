"use client";

import { Breadcrumb } from "@/components/common/Breadcrumb";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { ShipmentTrackerCard } from "@/components/logistics/ShipmentTrackerCard";
import { OrderCard } from "@/components/orders/OrderCard";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { CheckoutIntentButton } from "@/components/payments/CheckoutIntentButton";
import { useOrders } from "@/hooks/useOrders";
import { useConfirmOrderReceipt } from "@/hooks/useOrders";
import { BuyerButton, BuyerPanel } from "@/components/buyer/BuyerDesignSystem";
import toast from "react-hot-toast";
import { useShipmentByOrder } from "@/hooks/useLogistics";

export default function BuyerOrderDetailPage({ params }) {
  const { orders, isLoading } = useOrders();
  const order = (orders || []).find((item) => item.rawId === params.id || item.id === params.id);
  const { data: shipment } = useShipmentByOrder(order?.rawId);
  const confirmReceipt = useConfirmOrderReceipt();

  if (isLoading) {
    return <EmptyState title="Loading live order" description="Fetching order details from the database." />;
  }

  if (!order) {
    return <EmptyState title="Live order not found" description="This order is not connected to your buyer profile." />;
  }

  return (
    <section className="space-y-6">
      <Breadcrumb items={[{ label: "Buyer", href: "/buyer/dashboard" }, { label: "Orders", href: "/buyer/orders" }, { label: order.id }]} />
      <PageHeader eyebrow="Order detail" title={order.id} description={order.notes} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <OrderCard
          order={order}
          href={`/buyer/orders/${order.rawId || order.id}`}
          action={<CheckoutIntentButton order={order} />}
        />
        <OrderTimeline items={order.timeline || []} />
      </div>
      <ShipmentTrackerCard shipment={shipment} />
      {["delivered", "completed"].includes(order.status) ? (
        <BuyerPanel title="Delivery confirmation">
          <p className="text-[16px] font-semibold text-ink-950">Have you received your order?</p>
          <p className="mt-2 text-[14px] text-ink-500">Your confirmation is recorded and is required before an eligible verified seller can receive the protected payout.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <BuyerButton
              type="button"
              disabled={order.buyerReceiptStatus === "received" || confirmReceipt.isPending}
              onClick={async () => {
                try {
                  await confirmReceipt.mutateAsync(order.rawId);
                  toast.success("Order receipt confirmed.");
                } catch (error) {
                  toast.error(error.response?.data?.message || "Receipt could not be confirmed.");
                }
              }}
            >
              {order.buyerReceiptStatus === "received" ? "Receipt confirmed" : "Yes, I received it"}
            </BuyerButton>
            <BuyerButton href="/buyer/help-support" variant="outline">Report a problem</BuyerButton>
          </div>
        </BuyerPanel>
      ) : null}
    </section>
  );
}
