"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Search, X } from "lucide-react";
import { BuyerBrowseCard, BuyerEmptyState } from "@/components/buyer/BuyerDesignSystem";
import { Card } from "@/components/ui/card";
import { CountrySelector } from "@/components/common/CountrySelector";
import { useListings } from "@/hooks/useListings";
import { useI18n } from "@/i18n/I18nProvider";
import { useSitePrefsStore } from "@/store/sitePrefsStore";
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
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const storedCountry = useSitePrefsStore((state) => state.countryCode);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [exportReadyOnly, setExportReadyOnly] = useState(false);
  const [region, setRegion] = useState("South West");
  const [crop, setCrop] = useState("");
  const [country, setCountry] = useState(storedCountry || "CM");

  useEffect(() => {
    setQuery(searchParams.get("query") || "");
    setCountry(searchParams.get("country") || storedCountry || "CM");
    const highlight = searchParams.get("highlight");
    if (highlight === "verified") setVerifiedOnly(true);
    if (highlight === "export-ready") setExportReadyOnly(true);
  }, [searchParams, storedCountry]);

  const { listings, isLoading, error } = useListings({
    query: query.trim() || undefined,
    country: country && country !== "all" ? country : undefined,
  });

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
    country && country !== "all" ? country : null,
    crop,
    verifiedOnly ? "Verified Only" : null,
    exportReadyOnly ? "Export-ready" : null,
  ].filter(Boolean);

  const clearAll = () => {
    setVerifiedOnly(false);
    setExportReadyOnly(false);
    setRegion("");
    setCrop("");
    setCountry("all");
  };

  return (
    <section className="space-y-7 pb-24 md:pb-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="font-display text-[30px] font-bold leading-tight text-ink-950 sm:text-[36px]">{t("browse.title")}</h1>
          <p className="mt-2 text-[16px] text-ink-500 sm:text-[18px]">{t("browse.description")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <span className="text-[16px] text-ink-500">{t("browse.sortLabel")}</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="h-12 w-full min-w-0 rounded-lg border border-ink-200 bg-white px-4 text-[15px] font-bold text-ink-700 outline-none focus:border-green-700 focus:ring-4 focus:ring-green-800/10 sm:h-14 sm:min-w-[220px] sm:px-5 sm:text-[16px]"
            aria-label="Sort crop listings"
          >
            <option value="newest">{t("browse.sortNewest")}</option>
            <option value="price-asc">{t("browse.sortPriceAsc")}</option>
            <option value="price-desc">{t("browse.sortPriceDesc")}</option>
          </select>
        </div>
      </div>

      <div className="grid gap-7 xl:grid-cols-[320px_minmax(0,1fr)] 2xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="h-fit overflow-hidden rounded-2xl border border-ink-200 bg-white">
          <div className="flex items-center justify-between border-b border-ink-100 px-7 py-6">
            <h2 className="font-display text-[22px] font-bold text-ink-950">{t("common.filters")}</h2>
            <button type="button" onClick={clearAll} className="text-[15px] font-bold text-green-800">{t("common.clearAll")}</button>
          </div>

          <div className="space-y-7 p-7">
            <div>
              <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-ink-400">{t("common.search")}</p>
              <div className="relative mt-4">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("browse.searchPlaceholder")}
                  className="h-12 w-full rounded-lg border border-ink-200 bg-white pl-12 pr-4 text-[15px] outline-none focus:border-green-700 focus:ring-4 focus:ring-green-800/10"
                />
              </div>
            </div>

            <div>
              <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-ink-400">{t("common.country")}</p>
              <CountrySelector
                value={country || storedCountry || "CM"}
                onChange={setCountry}
                allowAll
                allLabel={t("common.allCountries")}
                className="mt-4 w-full"
                selectClassName="h-12 w-full rounded-lg bg-white py-0 text-[15px]"
              />
            </div>

            <div>
              <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-ink-400">{t("browse.verification")}</p>
              <div className="mt-4 space-y-3">
                <FilterCheck active={verifiedOnly} label={t("browse.verifiedOnly")} onClick={() => setVerifiedOnly((value) => !value)} />
                <FilterCheck active={exportReadyOnly} label={t("browse.exportReadyOnly")} onClick={() => setExportReadyOnly((value) => !value)} />
              </div>
            </div>

            <div>
              <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-ink-400">{t("browse.region")}</p>
              <div className="mt-4 space-y-2">
                {regions.map((item, index) => (
                  <FilterCheck key={item} active={region === item} label={item} count={[128, 94, 71, 88, 62, 54, 38, 47][index]} onClick={() => setRegion(region === item ? "" : item)} />
                ))}
              </div>
            </div>

            <div>
              <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-ink-400">{t("browse.cropType")}</p>
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
              <span className="text-[15px] font-semibold text-ink-500">{t("browse.activeFilters")}</span>
              {activeFilters.length ? activeFilters.map((filter) => (
                <span key={filter} className="inline-flex min-h-10 max-w-full items-center gap-2 rounded-full border border-green-800 bg-green-50 px-4 py-2 text-[14px] font-bold text-green-800 sm:text-[15px]">
                  {filter}
                  <X className="h-4 w-4" />
                </span>
              )) : <span className="text-[15px] text-ink-400">{t("browse.none")}</span>}
            </div>
            <p className="text-[15px] text-ink-400">{t("browse.showing", { from: filtered.length ? `1 - ${filtered.length}` : "0", total: listings.length })}</p>
          </div>

          {isLoading ? (
            <Card className="rounded-2xl p-8 text-center text-ink-500">{t("browse.loading")}</Card>
          ) : error ? (
            <Card className="rounded-2xl p-8 text-center text-red-700">{t("browse.error")}</Card>
          ) : filtered.length ? (
            <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
              {filtered.map((listing) => (
                <BuyerBrowseCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <BuyerEmptyState title={t("browse.emptyTitle")} description={t("browse.emptyHint")} />
          )}
        </main>
      </div>
    </section>
  );
}
