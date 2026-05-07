"use client";

import { LiveResourceCard, LiveResourcePage } from "@/components/dashboard/LiveResourcePage";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function AdminInspectionsPage() {
  const { data, isLoading } = useDashboardData("admin");
  const inspections = data?.inspections || [];

  return (
    <LiveResourcePage
      eyebrow="Admin inspections"
      title="Live inspection records"
      description="Database-backed quality and field inspection records."
      items={inspections}
      isLoading={isLoading}
      emptyTitle="No live inspections yet"
      emptyDescription="Inspection records will appear once orders request quality checks."
      renderItem={(inspection) => (
        <LiveResourceCard
          key={inspection.id}
          title={inspection.subject || "Inspection"}
          subtitle={inspection.report_url}
          detail={inspection.findings}
          status={inspection.status}
        />
      )}
    />
  );
}
