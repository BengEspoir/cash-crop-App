"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { CropCard } from "@/components/crops/CropCard";
import { CropSpecsTable } from "@/components/crops/CropSpecsTable";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useDeleteListing } from "@/hooks/useListings";

export default function FarmerListingDetailPage({ params }) {
  const router = useRouter();
  const { data, isLoading } = useDashboardData("farmer");
  const deleteListing = useDeleteListing();
  const listing = (data?.listings || []).find((item) => item.id === params.id);

  if (isLoading) {
    return <EmptyState title="Loading live listing" description="Fetching listing details from the database." />;
  }

  if (!listing) {
    return <EmptyState title="Live listing not found" description="This listing is not connected to your farmer profile." />;
  }

  const specs = Array.isArray(listing.specs)
    ? listing.specs
    : Object.entries(listing.specs || {}).map(([label, value]) => ({ label, value }));

  const handleArchive = async () => {
    try {
      await deleteListing.mutateAsync(listing.id);
      toast.success("Listing archived.");
      router.push("/farmer/listings");
    } catch (err) {
      toast.error(err.response?.data?.message || "Listing could not be archived.");
    }
  };

  return (
    <section className="space-y-6">
      <Breadcrumb items={[{ label: "Farmer", href: "/farmer/dashboard" }, { label: "Listings", href: "/farmer/listings" }, { label: listing.crop }]} />
      <PageHeader
        eyebrow="Listing detail"
        title={listing.crop}
        description={listing.summary}
        actions={(
          <>
            <Button asChild variant="outline">
              <Link href={`/farmer/listings/${listing.id}/edit`}>Edit listing</Link>
            </Button>
            <Button type="button" variant="danger" disabled={deleteListing.isPending} onClick={handleArchive}>Archive</Button>
          </>
        )}
      />
      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <CropCard listing={listing} href={`/farmer/listings/${listing.id}`} />
        <CropSpecsTable specs={specs} />
      </div>
    </section>
  );
}
