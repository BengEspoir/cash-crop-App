"use client";

import { CropListRow } from "@/components/crops/CropListRow";
import { LiveResourcePage } from "@/components/dashboard/LiveResourcePage";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function AdminListingsPage() {
  const { data, isLoading } = useDashboardData("admin");
  const listings = data?.listings || [];

  return (
    <LiveResourcePage
      eyebrow="Admin listings"
      title="Marketplace inventory review"
      description="Live crop listings from the database."
      items={listings}
      isLoading={isLoading}
      emptyTitle="No live listings yet"
      emptyDescription="Farmer-created listings will appear here after the listing backend is populated."
      renderItem={(listing) => <CropListRow key={listing.id} listing={listing} href={`/admin/listings/${listing.id}`} />}
    />
  );
}
