"use client";

import { Breadcrumb } from "@/components/common/Breadcrumb";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { ShipmentTrackerCard } from "@/components/logistics/ShipmentTrackerCard";
import { OrderCard } from "@/components/orders/OrderCard";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { CheckoutIntentButton } from "@/components/payments/CheckoutIntentButton";
import { useOrders } from "@/hooks/useOrders";
import { useShipmentByOrder } from "@/hooks/useLogistics";

export default function BuyerOrderDetailPage({ params }) {
  const { orders, isLoading } = useOrders();
  const order = (orders || []).find((item) => item.rawId === params.id || item.id === params.id);
  const { data: shipment } = useShipmentByOrder(order?.rawId);

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
    </section>
  );
}
