"use client";

import { useState } from "react";
import { OrderCard } from "@/components/orders/OrderCard";
import { CheckoutIntentButton } from "@/components/payments/CheckoutIntentButton";
import { LiveResourcePage } from "@/components/dashboard/LiveResourcePage";
import { exportDashboardCsv, useDashboardData, useDashboardFilters } from "@/hooks/useDashboardData";

export default function BuyerOrdersPage() {
  const [isExporting, setIsExporting] = useState(false);
  const filterState = useDashboardFilters("orders");
  const { data, isLoading } = useDashboardData("buyer", filterState.queryFilters);
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
      filters={filterState.filters}
      onFilterChange={filterState.updateFilter}
      onResetFilters={filterState.resetFilters}
      onExport={async () => {
        setIsExporting(true);
        try {
          await exportDashboardCsv("buyer", filterState.queryFilters);
        } finally {
          setIsExporting(false);
        }
      }}
      isExporting={isExporting}
      filterOptions={[
        { key: "status", label: "Status", options: [
          { value: "all", label: "Status: All" },
          { value: "pending", label: "Pending" },
          { value: "confirmed", label: "Confirmed" },
          { value: "transit", label: "In transit" },
          { value: "delivered", label: "Delivered" },
        ] },
        { key: "sort", label: "Sort", options: [
          { value: "newest", label: "Newest" },
          { value: "oldest", label: "Oldest" },
        ] },
      ]}
      renderItem={(order) => (
        <OrderCard
          key={order.rawId || order.id}
          order={order}
          href={`/buyer/orders/${order.rawId || order.id}`}
          action={<CheckoutIntentButton order={order} />}
        />
      )}
    />
  );
}
