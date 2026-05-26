"use client";

import { useState } from "react";
import { CropCard } from "@/components/crops/CropCard";
import { LiveResourcePage } from "@/components/dashboard/LiveResourcePage";
import { exportDashboardCsv, useDashboardData, useDashboardFilters } from "@/hooks/useDashboardData";

export default function BuyerSavedPage() {
  const [isExporting, setIsExporting] = useState(false);
  const filterState = useDashboardFilters("savedListings");
  const { data, isLoading } = useDashboardData("buyer", filterState.queryFilters);
  const savedListings = data?.savedListings || [];

  return (
    <LiveResourcePage
      eyebrow="Saved listings"
      title="Your live saved listings"
      description="Only real saved listings are shown here."
      items={savedListings}
      isLoading={isLoading}
      emptyTitle="No live saved listings yet"
      emptyDescription="Saved listings will appear after the saved-listings workflow records real activity."
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
        { key: "grade", label: "Grade", options: [
          { value: "all", label: "Grade: All" },
          { value: "a", label: "Grade A" },
          { value: "b", label: "Grade B" },
        ] },
        { key: "sort", label: "Sort", options: [
          { value: "newest", label: "Newest" },
          { value: "oldest", label: "Oldest" },
        ] },
      ]}
      renderItem={(listing) => <CropCard key={listing.id} listing={listing} />}
    />
  );
}
