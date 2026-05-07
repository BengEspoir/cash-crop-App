"use client";

import { LiveResourceCard, LiveResourcePage } from "@/components/dashboard/LiveResourcePage";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function AdminDisputesPage() {
  const { data, isLoading } = useDashboardData("admin");
  const disputes = data?.disputes || [];

  return (
    <LiveResourcePage
      eyebrow="Admin disputes"
      title="Live dispute queue"
      description="Database-backed dispute records."
      items={disputes}
      isLoading={isLoading}
      emptyTitle="No live disputes yet"
      emptyDescription="Disputes will appear when users raise real order issues."
      renderItem={(dispute) => (
        <LiveResourceCard
          key={dispute.id}
          title={dispute.subject || "Dispute"}
          subtitle={dispute.order_id}
          detail={dispute.description || dispute.resolution}
          status={dispute.status}
        />
      )}
    />
  );
}
