"use client";

import { useState } from "react";
import { LiveResourceCard, LiveResourcePage } from "@/components/dashboard/LiveResourcePage";
import { exportDashboardCsv, useDashboardData, useDashboardFilters } from "@/hooks/useDashboardData";

export default function BuyerDocumentsPage() {
  const [isExporting, setIsExporting] = useState(false);
  const filterState = useDashboardFilters("documents");
  const { data, isLoading } = useDashboardData("buyer", filterState.queryFilters);
  const documents = data?.documents || [];

  return (
    <LiveResourcePage
      eyebrow="Buyer documents"
      title="Your live trade documents"
      description="Only real export and compliance documents are shown here."
      items={documents}
      isLoading={isLoading}
      emptyTitle="No live documents yet"
      emptyDescription="Documents will appear when real orders generate compliance records."
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
          { value: "verified", label: "Verified" },
          { value: "rejected", label: "Rejected" },
        ] },
      ]}
      renderItem={(document) => (
        <LiveResourceCard
          key={document.id}
          title={document.title}
          subtitle={document.type}
          detail={document.fileUrl}
          status={document.status}
        />
      )}
    />
  );
}
