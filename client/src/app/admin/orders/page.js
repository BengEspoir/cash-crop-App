"use client";

import { OrderCard } from "@/components/orders/OrderCard";
import { LiveResourcePage } from "@/components/dashboard/LiveResourcePage";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function AdminOrdersPage() {
  const { data, isLoading } = useDashboardData("admin");
  const orders = data?.orders || [];

  return (
    <LiveResourcePage
      eyebrow="Admin orders"
      title="Live order oversight"
      description="Real order records from the database."
      items={orders}
      isLoading={isLoading}
      emptyTitle="No live orders yet"
      emptyDescription="Orders will appear here once buyers create real transactions."
      renderItem={(order) => <OrderCard key={order.rawId || order.id} order={order} href={`/admin/orders/${order.rawId || order.id}`} />}
    />
  );
}
