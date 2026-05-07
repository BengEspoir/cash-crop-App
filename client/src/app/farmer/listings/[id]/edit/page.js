"use client";

import Link from "next/link";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function FarmerListingEditPage({ params }) {
  const { data, isLoading } = useDashboardData("farmer");
  const listing = (data?.listings || []).find((item) => item.id === params.id);

  if (isLoading) {
    return <EmptyState title="Loading live listing" description="Fetching listing details from the database." />;
  }

  if (!listing) {
    return <EmptyState title="Live listing not found" description="This listing is not connected to your farmer profile." />;
  }

  return (
    <section className="space-y-6">
      <Breadcrumb items={[{ label: "Farmer", href: "/farmer/dashboard" }, { label: "Listings", href: "/farmer/listings" }, { label: listing.crop }]} />
      <PageHeader
        eyebrow="Edit listing"
        title={listing.crop}
        description="Live listing editing is not enabled yet. Listing details are loaded from your database records."
      />
      <Button asChild>
        <Link href={`/farmer/listings/${listing.id}`}>Back to live listing</Link>
      </Button>
    </section>
  );
}
