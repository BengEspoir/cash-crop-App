"use client";

import { CropCard } from "@/components/crops/CropCard";
import { LiveResourcePage } from "@/components/dashboard/LiveResourcePage";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function BuyerSavedPage() {
  const { data, isLoading } = useDashboardData("buyer");
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
      renderItem={(listing) => <CropCard key={listing.id} listing={listing} />}
    />
  );
}
