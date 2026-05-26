"use client";

import { useState } from "react";
import { LiveResourceCard, LiveResourcePage } from "@/components/dashboard/LiveResourcePage";
import { exportDashboardCsv, useDashboardData, useDashboardFilters } from "@/hooks/useDashboardData";

export default function BuyerQuotesPage() {
  const [isExporting, setIsExporting] = useState(false);
  const filterState = useDashboardFilters("quotes");
  const { data, isLoading } = useDashboardData("buyer", filterState.queryFilters);
  const quotes = data?.quotes || [];

  return (
    <LiveResourcePage
      eyebrow="Buyer quotes"
      title="Your live quote requests"
      description="Only real quote requests are shown here."
      items={quotes}
      isLoading={isLoading}
      emptyTitle="No live quotes yet"
      emptyDescription="Quote requests will appear once the inquiry workflow records real buyer activity."
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
          { value: "accepted", label: "Accepted" },
          { value: "rejected", label: "Rejected" },
        ] },
      ]}
      renderItem={(quote) => (
        <LiveResourceCard
          key={quote.id}
          title={quote.title || quote.crop || "Quote request"}
          detail={quote.message || quote.summary}
          status={quote.status}
        />
      )}
    />
  );
}
