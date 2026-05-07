"use client";

import { OrderCard } from "@/components/orders/OrderCard";
import { LiveResourcePage } from "@/components/dashboard/LiveResourcePage";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function FarmerOrdersPage() {
  const { data, isLoading } = useDashboardData("farmer");
  const orders = data?.orders || [];

  return (
    <LiveResourcePage
      eyebrow="Farmer orders"
      title="Your live buyer orders"
      description="Only real orders connected to your farmer profile are shown here."
      items={orders}
      isLoading={isLoading}
      emptyTitle="No live orders yet"
      emptyDescription="Orders will appear once buyers place real requests for your listings."
      renderItem={(order) => <OrderCard key={order.rawId || order.id} order={order} href={`/farmer/orders/${order.rawId || order.id}`} />}
    />
  );
}
