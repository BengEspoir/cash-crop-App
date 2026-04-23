"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterTabs } from "@/components/common/FilterTabs";
import { CropListRow } from "@/components/crops/CropListRow";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { demoListings } from "@/lib/demo-data";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "verified", label: "Verified" },
  { value: "export-ready", label: "Export-ready" },
  { value: "negotiable", label: "Negotiable" },
  { value: "pending", label: "Pending" },
];

export default function AdminListingsPage() {
  const [status, setStatus] = useState("all");

  const options = useMemo(() => {
    const counts = { all: demoListings.length };
    for (const item of demoListings) {
      counts[item.status] = (counts[item.status] ?? 0) + 1;
    }
    return STATUS_OPTIONS.map((opt) => ({ ...opt, count: counts[opt.value] ?? 0 }));
  }, []);

  const filtered = useMemo(
    () => (status === "all" ? demoListings : demoListings.filter((row) => row.status === status)),
    [status],
  );

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Admin listings"
        title="Marketplace inventory review"
        description="Review published crop listings, flag polish issues, and confirm buyer-facing readiness."
      />

      <Reveal>
        <div className="rounded-[18px] border border-ink-100 bg-white p-4 shadow-soft">
          <FilterTabs options={options} value={status} onChange={setStatus} />
        </div>
      </Reveal>

      <Stagger className="grid gap-4">
        {filtered.map((listing) => (
          <StaggerItem key={listing.id}>
            <CropListRow listing={listing} href={`/admin/listings/${listing.id}`} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
