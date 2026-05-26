"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Search, X } from "lucide-react";
import { BuyerBrowseCard, BuyerEmptyState } from "@/components/buyer/BuyerDesignSystem";
import { Card } from "@/components/ui/card";
import { useListings } from "@/hooks/useListings";
import { cn } from "@/lib/utils";

const regions = ["South West", "Littoral", "West", "North West", "Centre", "North", "Adamawa", "South"];
const cropTypes = ["Cocoa", "Coffee", "Maize", "Plantain", "Pepper", "Cassava"];

function FilterCheck({ active, label, count, onClick }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-lg py-1.5 text-left text-[16px] text-ink-600 transition-colors hover:text-green-800">
      <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-md border", active ? "border-green-800 bg-green-800 text-white" : "border-ink-200 bg-white text-transparent")}>
        <Check className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">{label}</span>
      {typeof count === "number" ? <span className="text-[14px] text-ink-400">{count}</span> : null}
    </button>
  );
}

export default function BrowsePage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [exportReadyOnly, setExportReadyOnly] = useState(false);
  const [region, setRegion] = useState("South West");
  const [crop, setCrop] = useState("");

  useEffect(() => {
    setQuery(searchParams.get("query") || "");
    const highlight = searchParams.get("highlight");
    if (highlight === "verified") setVerifiedOnly(true);
    if (highlight === "export-ready") setExportReadyOnly(true);
  }, [searchParams]);

  const { listings, isLoading, error } = useListings({ query: query.trim() || undefined });

  const filtered = useMemo(() => {
    const base = listings.filter((listing) => {
      if (verifiedOnly && listing.farmerVerificationStatus !== "verified") return false;
      if (exportReadyOnly && !listing.exportReady) return false;
      if (region && !String(listing.location || "").toLowerCase().includes(region.toLowerCase())) return false;
      if (crop && !String(listing.crop || "").toLowerCase().includes(crop.toLowerCase())) return false;
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
  }, [crop, exportReadyOnly, listings, region, sort, verifiedOnly]);

  const activeFilters = [
    region,
    crop,
    verifiedOnly ? "Verified Only" : null,
    exportReadyOnly ? "Export-ready" : null,
  ].filter(Boolean);

  const clearAll = () => {
    setVerifiedOnly(false);
    setExportReadyOnly(false);
    setRegion("");
    setCrop("");
  };

  return (
    <section className="space-y-7 pb-24 md:pb-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="font-serif text-[36px] font-bold leading-tight text-ink-950">Browse Crop Listings</h1>
          <p className="mt-2 text-[18px] text-ink-500">Find and filter premium certified crops directly from Cameroonian farmers.</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[16px] text-ink-500">Sort by:</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="h-14 min-w-[220px] rounded-lg border border-ink-200 bg-white px-5 text-[16px] font-bold text-ink-700 outline-none focus:border-green-700 focus:ring-4 focus:ring-green-800/10"
            aria-label="Sort crop listings"
          >
            <option value="newest">Newest Listed</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="grid gap-7 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="h-fit overflow-hidden rounded-2xl border border-ink-200 bg-white">
          <div className="flex items-center justify-between border-b border-ink-100 px-7 py-6">
            <h2 className="text-[22px] font-bold text-ink-950">Filters</h2>
            <button type="button" onClick={clearAll} className="text-[15px] font-bold text-green-800">Clear all</button>
          </div>

          <div className="space-y-7 p-7">
            <div>
              <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-ink-400">Search</p>
              <div className="relative mt-4">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search crops..."
                  className="h-12 w-full rounded-lg border border-ink-200 bg-white pl-12 pr-4 text-[15px] outline-none focus:border-green-700 focus:ring-4 focus:ring-green-800/10"
                />
              </div>
            </div>

            <div>
              <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-ink-400">Verification</p>
              <div className="mt-4 space-y-3">
                <FilterCheck active={verifiedOnly} label="Verified Only" onClick={() => setVerifiedOnly((value) => !value)} />
                <FilterCheck active={exportReadyOnly} label="Export-ready Only" onClick={() => setExportReadyOnly((value) => !value)} />
              </div>
            </div>

            <div>
              <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-ink-400">Region</p>
              <div className="mt-4 space-y-2">
                {regions.map((item, index) => (
                  <FilterCheck key={item} active={region === item} label={item} count={[128, 94, 71, 88, 62, 54, 38, 47][index]} onClick={() => setRegion(region === item ? "" : item)} />
                ))}
              </div>
            </div>

            <div>
              <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-ink-400">Crop Type</p>
              <div className="mt-4 space-y-2">
                {cropTypes.map((item, index) => (
                  <FilterCheck key={item} active={crop === item} label={item} count={[312, 187, 241, 84, 52, 130][index]} onClick={() => setCrop(crop === item ? "" : item)} />
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[15px] font-semibold text-ink-500">Active Filters:</span>
              {activeFilters.length ? activeFilters.map((filter) => (
                <span key={filter} className="inline-flex h-10 items-center gap-2 rounded-full border border-green-800 bg-green-50 px-4 text-[15px] font-bold text-green-800">
                  {filter}
                  <X className="h-4 w-4" />
                </span>
              )) : <span className="text-[15px] text-ink-400">None</span>}
            </div>
            <p className="text-[15px] text-ink-400">Showing {filtered.length ? `1 - ${filtered.length}` : "0"} of {listings.length} active listings</p>
          </div>

          {isLoading ? (
            <Card className="rounded-2xl p-8 text-center text-ink-500">Loading crop listings...</Card>
          ) : error ? (
            <Card className="rounded-2xl p-8 text-center text-red-700">Crop listings could not be loaded.</Card>
          ) : filtered.length ? (
            <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
              {filtered.map((listing) => (
                <BuyerBrowseCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <BuyerEmptyState title="No listings match these filters" description="Clear filters or try a different crop, region, or verification option." />
          )}
        </main>
      </div>
    </section>
  );
}
