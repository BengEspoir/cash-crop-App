"use client";

import { LiveResourceCard, LiveResourcePage } from "@/components/dashboard/LiveResourcePage";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function AdminLogisticsPage() {
  const { data, isLoading } = useDashboardData("admin");
  const logistics = data?.logistics || [];

  return (
    <LiveResourcePage
      eyebrow="Admin logistics"
      title="Live logistics lanes"
      description="Database-backed logistics records."
      items={logistics}
      isLoading={isLoading}
      emptyTitle="No live logistics records yet"
      emptyDescription="Shipment and carrier records will appear once orders move into fulfillment."
      renderItem={(item) => (
        <LiveResourceCard
          key={item.id}
          title={item.lane || item.tracking_number || "Logistics record"}
          subtitle={item.carrier_name || item.current_location}
          detail={item.tracking_number}
          status={item.status}
        />
      )}
    />
  );
}
