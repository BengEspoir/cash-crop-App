"use client";

import { FarmerEmptyState, FarmerHeader, FarmerOrderRow, FarmerPage, FarmerTabs } from "@/components/farmer/FarmerDesignSystem";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function FarmerOrdersPage() {
  const { data, isLoading } = useDashboardData("farmer");
  const orders = data?.orders || [];
  const active = orders.filter((order) => !["completed", "cancelled", "canceled"].includes(String(order.status).toLowerCase())).length;
  const completed = orders.filter((order) => String(order.status).toLowerCase().includes("complete")).length;
  const inTransit = orders.filter((order) => String(order.status).toLowerCase().includes("transit")).length;

  return (
    <FarmerPage>
      <FarmerHeader title="My Orders" description={`${active} active - ${completed} completed`} />
      <FarmerTabs
        active="all"
        tabs={[
          { id: "all", label: `All (${orders.length})` },
          { id: "active", label: `Active (${active})` },
          { id: "pickup", label: "Awaiting Pickup (0)" },
          { id: "transit", label: `In Transit (${inTransit})` },
          { id: "completed", label: `Completed (${completed})` },
          { id: "cancelled", label: "Cancelled (0)" },
        ]}
      />

      {isLoading ? (
        <div className="rounded-2xl border border-ink-200 bg-white p-8 text-center text-[16px] text-ink-500">Loading live orders...</div>
      ) : orders.length ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <FarmerOrderRow key={order.rawId || order.id} order={order} />
          ))}
        </div>
      ) : (
        <FarmerEmptyState title="No live orders yet" description="Orders will appear once buyers place real requests for your listings." />
      )}
    </FarmerPage>
  );
}
