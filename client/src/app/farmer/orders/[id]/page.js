"use client";

import { Breadcrumb } from "@/components/common/Breadcrumb";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { OrderCard } from "@/components/orders/OrderCard";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function FarmerOrderDetailPage({ params }) {
  const { data, isLoading } = useDashboardData("farmer");
  const order = (data?.orders || []).find((item) => item.rawId === params.id || item.id === params.id);

  if (isLoading) {
    return <EmptyState title="Loading live order" description="Fetching order details from the database." />;
  }

  if (!order) {
    return <EmptyState title="Live order not found" description="This order is not connected to your farmer profile." />;
  }

  return (
    <section className="space-y-6">
      <Breadcrumb items={[{ label: "Farmer", href: "/farmer/dashboard" }, { label: "Orders", href: "/farmer/orders" }, { label: order.id }]} />
      <PageHeader eyebrow="Order detail" title={order.id} description={order.notes} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <OrderCard order={order} href={`/farmer/orders/${order.rawId || order.id}`} />
        <OrderTimeline items={order.timeline || []} />
      </div>
    </section>
  );
}
