"use client";

import { useMemo, useState } from "react";
import { Grid3x3, List, SlidersHorizontal } from "lucide-react";
import { PageHeader } from "../../../components/common/PageHeader";
import { Pagination } from "../../../components/common/Pagination";
import { CropCard } from "../../../components/crops/CropCard";
import { CropListRow } from "../../../components/crops/CropListRow";
import { Button } from "../../../components/ui/button";
import { Stagger, StaggerItem } from "../../../components/motion/Reveal";
import { demoListings } from "../../../lib/demo-data";
import { cn } from "../../../lib/utils";

const statusFilters = [
  { label: "All", value: "all" },
  { label: "Verified", value: "verified" },
  { label: "Export-ready", value: "export-ready" },
  { label: "Negotiable", value: "negotiable" },
  { label: "Pending", value: "pending" },
];

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: low → high", value: "price-asc" },
  { label: "Price: high → low", value: "price-desc" },
];

export default function BrowsePage() {
  const [status, setStatus] = useState("all");
  const [layout, setLayout] = useState("grid");
  const [sort, setSort] = useState("newest");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const base = demoListings.filter((listing) => {
      if (status !== "all" && listing.status !== status) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          listing.crop.toLowerCase().includes(q) ||
          listing.location.toLowerCase().includes(q)
        );
      }
      return true;
    });

    switch (sort) {
      case "price-asc":
        return [...base].sort((a, b) => (a.priceValue ?? 0) - (b.priceValue ?? 0));
      case "price-desc":
        return [...base].sort((a, b) => (b.priceValue ?? 0) - (a.priceValue ?? 0));
      default:
        return base;
    }
  }, [status, sort, query]);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Marketplace"
        title="Browse active crop supply"
        description="Explore the current demo marketplace surface with verified lots, export-ready packaging notes, and destination-aware trade details."
      />

      <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-soft lg:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-ink-300 bg-ink-50 p-1.5 px-3 focus-within:border-green-800 focus-within:bg-white transition-colors">
            <SlidersHorizontal className="h-4 w-4 text-ink-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by crop or region"
              className="h-8 w-full border-0 bg-transparent p-0 text-[13px] text-ink-800 outline-none placeholder:text-ink-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-10 rounded-[10px] border border-ink-300 bg-white px-3 text-[13px] text-ink-700 focus:border-green-800 focus:outline-none focus:ring-4 focus:ring-green-800/10"
              aria-label="Sort listings"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <div className="inline-flex items-center overflow-hidden rounded-[10px] border border-ink-300 bg-white">
              <button
                type="button"
                aria-pressed={layout === "grid"}
                onClick={() => setLayout("grid")}
                className={cn(
                  "inline-flex h-10 w-10 items-center justify-center text-ink-500 transition-colors",
                  layout === "grid" && "bg-green-100 text-green-800",
                )}
                aria-label="Grid view"
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-pressed={layout === "list"}
                onClick={() => setLayout("list")}
                className={cn(
                  "inline-flex h-10 w-10 items-center justify-center text-ink-500 transition-colors",
                  layout === "list" && "bg-green-100 text-green-800",
                )}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <Button
              key={filter.value}
              type="button"
              variant={status === filter.value ? "primary" : "secondary"}
              className="h-8 px-3 text-[12px]"
              onClick={() => setStatus(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
          <span className="ml-auto self-center text-[12px] text-ink-500">
            {filtered.length} listing{filtered.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-300 bg-white p-12 text-center">
          <p className="text-[14px] font-semibold text-ink-800">No listings match your filters.</p>
          <p className="mt-1 text-[13px] text-ink-500">Try clearing the search or status filter.</p>
        </div>
      ) : layout === "grid" ? (
        <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" stagger={0.04}>
          {filtered.map((listing) => (
            <StaggerItem key={listing.id} className="h-full">
              <CropCard listing={listing} />
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <Stagger className="space-y-3" stagger={0.03}>
          {filtered.map((listing) => (
            <StaggerItem key={listing.id}>
              <CropListRow listing={listing} href={`/crops/${listing.id}`} />
            </StaggerItem>
          ))}
        </Stagger>
      )}

      <Pagination current={1} total={1} />
    </section>
  );
}
