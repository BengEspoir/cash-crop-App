"use client";

import { useMemo, useState } from "react";
import { Grid3x3, List, SlidersHorizontal } from "lucide-react";
import { PageHeader } from "../../../components/common/PageHeader";
import { Pagination } from "../../../components/common/Pagination";
import { CropCard } from "../../../components/crops/CropCard";
import { CropListRow } from "../../../components/crops/CropListRow";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Stagger, StaggerItem } from "../../../components/motion/Reveal";
import { useListings } from "../../../hooks/useListings";
import { cn } from "../../../lib/utils";

const statusFilters = [
  { label: "All", value: "all" },
  { label: "Verified farmers", value: "verified" },
  { label: "Not verified", value: "not_started" },
  { label: "Export-ready", value: "export-ready" },
];

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: low to high", value: "price-asc" },
  { label: "Price: high to low", value: "price-desc" },
];

export default function BrowsePage() {
  const [status, setStatus] = useState("all");
  const [layout, setLayout] = useState("grid");
  const [sort, setSort] = useState("newest");
  const [query, setQuery] = useState("");
  const { listings, isLoading, error } = useListings({ query });

  const filtered = useMemo(() => {
    const base = listings.filter((listing) => {
      if (status === "verified" && listing.farmerVerificationStatus !== "verified") return false;
      if (status === "not_started" && listing.farmerVerificationStatus === "verified") return false;
      if (status === "export-ready" && !listing.exportReady) return false;
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
  }, [listings, status, sort]);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Marketplace"
        title="Browse active crop supply"
        description="Explore real crop listings from farmers on AgriculNet, with verification status shown before you engage."
      />

      <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-soft lg:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-ink-300 bg-ink-50 p-1.5 px-3 transition-colors focus-within:border-green-800 focus-within:bg-white">
            <SlidersHorizontal className="h-4 w-4 text-ink-500" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by crop, region, or farmer"
              className="h-8 w-full border-0 bg-transparent p-0 text-[13px] text-ink-800 outline-none placeholder:text-ink-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-10 rounded-[10px] border border-ink-300 bg-white px-3 text-[13px] text-ink-700 focus:border-green-800 focus:outline-none focus:ring-4 focus:ring-green-800/10"
              aria-label="Sort listings"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            <div role="group" aria-label="Change layout" className="inline-flex items-center overflow-hidden rounded-[10px] border border-ink-300 bg-white">
              <button
                type="button"
                aria-pressed={layout === "grid"}
                onClick={() => setLayout("grid")}
                className={cn("focus-ring inline-flex h-10 w-10 items-center justify-center text-ink-500 transition-colors", layout === "grid" && "bg-green-100 text-green-800")}
                aria-label="Grid view"
              >
                <Grid3x3 className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-pressed={layout === "list"}
                onClick={() => setLayout("list")}
                className={cn("focus-ring inline-flex h-10 w-10 items-center justify-center text-ink-500 transition-colors", layout === "list" && "bg-green-100 text-green-800")}
                aria-label="List view"
              >
                <List className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {statusFilters.map((filter) => (
            <Button
              key={filter.value}
              type="button"
              aria-pressed={status === filter.value}
              variant={status === filter.value ? "primary" : "secondary"}
              className="h-8 px-3 text-[12px]"
              onClick={() => setStatus(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
          <span className="ml-auto self-center text-[12px] text-ink-500" aria-live="polite">
            {filtered.length} listing{filtered.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {isLoading ? (
        <Card className="rounded-[16px] p-8 text-center text-ink-500">Loading real marketplace listings...</Card>
      ) : error ? (
        <Card className="rounded-[16px] p-8 text-center text-red-700">Listings could not be loaded. Check the backend deployment and API URL.</Card>
      ) : filtered.length === 0 ? (
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
