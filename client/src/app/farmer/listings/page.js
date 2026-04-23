"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterTabs } from "@/components/common/FilterTabs";
import { CropListRow } from "@/components/crops/CropListRow";
import { CropCard } from "@/components/crops/CropCard";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { demoListings } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "verified", label: "Verified" },
  { value: "export-ready", label: "Export-ready" },
  { value: "negotiable", label: "Negotiable" },
  { value: "pending", label: "Pending" },
];

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low → high" },
  { value: "price-desc", label: "Price: high → low" },
  { value: "name", label: "Crop name" },
];

export default function FarmerListingsPage() {
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [layout, setLayout] = useState("list");

  const options = useMemo(() => {
    const counts = { all: demoListings.length };
    for (const item of demoListings) {
      counts[item.status] = (counts[item.status] ?? 0) + 1;
    }
    return STATUS_OPTIONS.map((opt) => ({ ...opt, count: counts[opt.value] ?? 0 }));
  }, []);

  const filtered = useMemo(() => {
    let rows = [...demoListings];
    if (status !== "all") rows = rows.filter((row) => row.status === status);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      rows = rows.filter((row) =>
        row.crop.toLowerCase().includes(q) || row.location.toLowerCase().includes(q),
      );
    }
    switch (sort) {
      case "price-asc":
        rows.sort((a, b) => (a.priceValue ?? 0) - (b.priceValue ?? 0));
        break;
      case "price-desc":
        rows.sort((a, b) => (b.priceValue ?? 0) - (a.priceValue ?? 0));
        break;
      case "name":
        rows.sort((a, b) => a.crop.localeCompare(b.crop));
        break;
      default:
        break;
    }
    return rows;
  }, [status, query, sort]);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Farmer listings"
        title="Inventory, readiness, and market presentation"
        description="Review every published lot, update packaging details, and keep buyer-facing information consistent."
        actions={
          <Button asChild>
            <Link href="/farmer/listings/new">New listing</Link>
          </Button>
        }
      />

      <Reveal>
        <div className="rounded-[18px] border border-ink-100 bg-white p-4 shadow-soft">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <FilterTabs
              options={options}
              value={status}
              onChange={setStatus}
              ariaLabel="Filter listings by status"
            />
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full min-w-[220px] md:w-[260px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <Input
                  className="pl-9"
                  placeholder="Search crop or region"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  aria-label="Search listings"
                />
              </div>
              <label className="inline-flex items-center gap-2 rounded-[10px] border border-ink-200 bg-white px-3 py-2 text-[12.5px] text-ink-700 focus-within:ring-4 focus-within:ring-green-800/15">
                <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="sr-only">Sort listings</span>
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  aria-label="Sort listings"
                  className="bg-transparent text-[12.5px] text-ink-700 outline-none"
                >
                  {SORTS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <div
                role="group"
                aria-label="Change layout"
                className="inline-flex overflow-hidden rounded-[10px] border border-ink-200 bg-white"
              >
                {["list", "grid"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setLayout(option)}
                    aria-pressed={layout === option}
                    aria-label={`${option} layout`}
                    className={cn(
                      "focus-ring px-3 py-2 text-[12px] font-semibold capitalize transition",
                      layout === option ? "bg-green-700 text-white" : "text-ink-600 hover:bg-ink-50",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-ink-500">
            Showing <span className="font-semibold text-ink-800">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "listing" : "listings"}
          </p>
        </div>
      </Reveal>

      {filtered.length === 0 ? (
        <div className="rounded-[18px] border border-dashed border-ink-200 bg-white p-10 text-center text-ink-500">
          No listings match these filters. Clear the search or try a different status.
        </div>
      ) : layout === "list" ? (
        <Stagger className="grid gap-4">
          {filtered.map((listing) => (
            <StaggerItem key={listing.id}>
              <CropListRow listing={listing} href={`/farmer/listings/${listing.id}`} />
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((listing) => (
            <StaggerItem key={listing.id}>
              <CropCard listing={listing} href={`/farmer/listings/${listing.id}`} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </section>
  );
}
