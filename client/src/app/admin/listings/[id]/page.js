"use client";

import { Breadcrumb } from "@/components/common/Breadcrumb";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { CropSpecsTable } from "@/components/crops/CropSpecsTable";
import { CropCard } from "@/components/crops/CropCard";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function AdminListingDetailPage({ params }) {
  const { data, isLoading } = useDashboardData("admin");
  const listing = (data?.listings || []).find((item) => item.id === params.id);

  if (isLoading) {
    return <EmptyState title="Loading live listing" description="Fetching listing details from the database." />;
  }

  if (!listing) {
    return <EmptyState title="Live listing not found" description="This listing is not present in the database response." />;
  }

  const specs = Array.isArray(listing.specs)
    ? listing.specs
    : Object.entries(listing.specs || {}).map(([label, value]) => ({ label, value }));

  return (
    <section className="space-y-6">
      <Breadcrumb items={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Listings", href: "/admin/listings" }, { label: listing.crop }]} />
      <PageHeader eyebrow="Listing detail" title={listing.crop} description={listing.summary} />
      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <CropCard listing={listing} href={`/admin/listings/${listing.id}`} />
        <CropSpecsTable specs={specs} />
      </div>
    </section>
  );
}
