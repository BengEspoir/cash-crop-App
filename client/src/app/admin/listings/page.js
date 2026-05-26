"use client";

import { useState } from "react";
import Link from "next/link";
import { Leaf, PackageCheck, ShieldCheck, Sprout } from "lucide-react";
import {
  AdminCard,
  AdminDataTable,
  AdminPageHeader,
  AdminStatCard,
  AdminStatusPill,
  AdminToolbar,
  formatAdminDate,
} from "@/components/admin/AdminDesignSystem";
import { Button } from "@/components/ui/button";
import { exportDashboardCsv, useDashboardData, useDashboardFilters } from "@/hooks/useDashboardData";

export default function AdminListingsPage() {
  const [isExporting, setIsExporting] = useState(false);
  const filterState = useDashboardFilters("listings");
  const { data, isLoading } = useDashboardData("admin", filterState.queryFilters);
  const listings = data?.listings || [];
  const active = listings.filter((listing) => ["verified", "active", "export-ready"].includes(String(listing.status || "").toLowerCase())).length;
  const pending = listings.filter((listing) => String(listing.status || "").includes("pending")).length;

  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="Listings Review"
        eyebrow="Admin > Listings"
        description="Moderate live marketplace inventory, listing quality, and export readiness."
        actionLabel="Export CSV"
        actionLoading={isExporting}
        onAction={async () => {
          setIsExporting(true);
          try {
            await exportDashboardCsv("admin", filterState.queryFilters);
          } finally {
            setIsExporting(false);
          }
        }}
      />

      <div className="grid gap-5 md:grid-cols-3">
        <AdminStatCard icon={Sprout} value={listings.length} label="Total Listings" tag="Marketplace" tone="green" progress={64} />
        <AdminStatCard icon={ShieldCheck} value={active} label="Active Listings" tag="Live" tone="blue" progress={52} />
        <AdminStatCard icon={PackageCheck} value={pending} label="Pending Review" tag="Action required" tone="gold" progress={30} />
      </div>

      <AdminCard title="Marketplace Inventory">
        <div className="border-b border-ink-100 p-6">
          <AdminToolbar
            searchPlaceholder="Search crop, farmer, location..."
            values={filterState.filters}
            onChange={filterState.updateFilter}
            onReset={filterState.resetFilters}
            filterOptions={[
              { key: "status", label: "Status", options: [
                { value: "all", label: "Status: All" },
                { value: "active", label: "Active" },
                { value: "verified", label: "Verified" },
                { value: "pending", label: "Pending" },
                { value: "rejected", label: "Rejected" },
              ] },
              { key: "grade", label: "Grade", options: [
                { value: "all", label: "Grade: All" },
                { value: "a", label: "Grade A" },
                { value: "b", label: "Grade B" },
                { value: "c", label: "Grade C" },
              ] },
              { key: "sort", label: "Sort", options: [
                { value: "newest", label: "Newest" },
                { value: "oldest", label: "Oldest" },
              ] },
            ]}
            totalLabel={`${listings.length} live listings`}
          />
        </div>
        <AdminDataTable
          columns={[
            {
              key: "crop",
              label: "Listing",
              render: (listing) => (
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-800">
                    <Leaf className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="font-bold text-ink-900">{listing.crop}</p>
                    <p className="mt-1 text-[13px] text-ink-400">{listing.grade || "Grade pending"}</p>
                  </div>
                </div>
              ),
            },
            { key: "quantity", label: "Quantity", render: (listing) => listing.quantity },
            { key: "location", label: "Location", render: (listing) => listing.location },
            { key: "price", label: "Price", render: (listing) => <span className="font-bold text-ink-900">{listing.price}</span> },
            { key: "status", label: "Status", render: (listing) => <AdminStatusPill status={listing.status} /> },
            { key: "createdAt", label: "Updated", render: (listing) => formatAdminDate(listing.updatedAt || listing.createdAt) },
            {
              key: "actions",
              label: "Actions",
              render: (listing) => (
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/admin/listings/${listing.id}`}>View</Link>
                </Button>
              ),
            },
          ]}
          rows={listings}
          emptyTitle={isLoading ? "Loading live listings..." : "No live listings yet"}
          emptyDescription="Farmer-created listings will appear here after the listing backend is populated."
        />
      </AdminCard>
    </section>
  );
}
