"use client";

import { CropListRow } from "@/components/crops/CropListRow";
import { LiveResourcePage } from "@/components/dashboard/LiveResourcePage";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function FarmerListingsPage() {
  const { data, isLoading } = useDashboardData("farmer");
  const listings = data?.listings || [];

  return (
    <LiveResourcePage
      eyebrow="Farmer listings"
      title="Your live crop listings"
      description="Only real listings created for your farmer profile are shown here."
      items={listings}
      isLoading={isLoading}
      emptyTitle="No live listings yet"
      emptyDescription="Create your first listing once your account is approved and the listing workflow is available."
      renderItem={(listing) => <CropListRow key={listing.id} listing={listing} href={`/farmer/listings/${listing.id}`} />}
    />
  );
}
