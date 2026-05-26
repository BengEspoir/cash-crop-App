"use client";

import { Plus } from "lucide-react";
import {
  FarmerButton,
  FarmerEmptyState,
  FarmerFilters,
  FarmerHeader,
  FarmerListingTile,
  FarmerPage,
  FarmerTabs,
} from "@/components/farmer/FarmerDesignSystem";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function FarmerListingsPage() {
  const { data, isLoading } = useDashboardData("farmer");
  const listings = data?.listings || [];
  const active = listings.filter((item) => ["verified", "active"].includes(String(item.status).toLowerCase())).length;
  const pending = listings.filter((item) => String(item.status).toLowerCase().includes("pending")).length;
  const rejected = listings.filter((item) => String(item.status).toLowerCase().includes("reject")).length;

  return (
    <FarmerPage>
      <FarmerHeader
        title="My Listings"
        description={`${active} active - ${pending} pending - ${listings.length} total live records`}
        action={<FarmerButton href="/farmer/listings/new" icon={Plus}>Add New Listing</FarmerButton>}
      />

      <FarmerTabs
        active="all"
        tabs={[
          { id: "all", label: `All (${listings.length})` },
          { id: "active", label: `Active (${active})` },
          { id: "pending", label: `Pending (${pending})` },
          { id: "rejected", label: `Rejected (${rejected})` },
          { id: "draft", label: "Draft (0)" },
        ]}
      />

      <FarmerFilters searchPlaceholder="Search my listings..." filters={["Crop: All", "Status: All", "Date: Newest"]} />

      {isLoading ? (
        <div className="rounded-2xl border border-ink-200 bg-white p-8 text-center text-[16px] text-ink-500">Loading live listings...</div>
      ) : listings.length ? (
        <div className="grid gap-6 xl:grid-cols-3">
          {listings.map((listing, index) => (
            <FarmerListingTile key={listing.id} listing={listing} index={index} />
          ))}
        </div>
      ) : (
        <FarmerEmptyState
          title="No live listings yet"
          description="Create your first listing once your account is approved and the listing workflow is available."
          action={<FarmerButton href="/farmer/listings/new" icon={Plus}>Create Listing</FarmerButton>}
        />
      )}
    </FarmerPage>
  );
}
