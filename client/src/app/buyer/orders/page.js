"use client";

import { OrderCard } from "@/components/orders/OrderCard";
import { LiveResourcePage } from "@/components/dashboard/LiveResourcePage";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function BuyerOrdersPage() {
  const { data, isLoading } = useDashboardData("buyer");
  const orders = data?.orders || [];

  return (
    <LiveResourcePage
      eyebrow="Buyer orders"
      title="Your live orders"
      description="Only real orders connected to your buyer profile are shown here."
      items={orders}
      isLoading={isLoading}
      emptyTitle="No live orders yet"
      emptyDescription="Orders will appear after you place real crop orders."
      renderItem={(order) => <OrderCard key={order.rawId || order.id} order={order} href={`/buyer/orders/${order.rawId || order.id}`} />}
    />
  );
}
