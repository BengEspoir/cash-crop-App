"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Grid3x3, List, SlidersHorizontal } from "lucide-react";
import { PageHeader } from "../../../components/common/PageHeader";
import { Pagination } from "../../../components/common/Pagination";
import { MobileMarketplaceDock } from "../../../components/marketplace/MobileMarketplaceDock";
import { CropCard } from "../../../components/crops/CropCard";
import { CropListRow } from "../../../components/crops/CropListRow";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Stagger, StaggerItem } from "../../../components/motion/Reveal";
import { useListings } from "../../../hooks/useListings";
import { cn } from "../../../lib/utils";
import { useI18n } from "../../../i18n/I18nProvider";

export default function BrowsePage() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("all");
  const [layout, setLayout] = useState("grid");
  const [sort, setSort] = useState("newest");
  const [query, setQuery] = useState("");

  useEffect(() => {
    setQuery(searchParams.get("query") || "");
  }, [searchParams]);

  useEffect(() => {
    const h = searchParams.get("highlight");
    if (h === "verified") setStatus("verified");
    if (h === "export-ready") setStatus("export-ready");
  }, [searchParams]);

  const { listings, isLoading, error } = useListings({ query: query.trim() || undefined });

  const statusFilters = useMemo(
    () => [
      { labelKey: "browse.filterAll", value: "all" },
      { labelKey: "browse.filterVerified", value: "verified" },
      { labelKey: "browse.filterNotVerified", value: "not_started" },
      { labelKey: "browse.filterExport", value: "export-ready" },
    ],
    [],
  );

  const sortOptions = useMemo(
    () => [
      { labelKey: "browse.sortNewest", value: "newest" },
      { labelKey: "browse.sortPriceAsc", value: "price-asc" },
      { labelKey: "browse.sortPriceDesc", value: "price-desc" },
    ],
    [],
  );

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
    <section className="space-y-6 pb-24 md:pb-6">
      <PageHeader
        eyebrow={t("browse.eyebrow")}
        title={t("browse.title")}
        description={t("browse.description")}
      />

      <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-soft lg:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-ink-300 bg-ink-50 p-1.5 px-3 transition-colors focus-within:border-green-800 focus-within:bg-white">
            <SlidersHorizontal className="h-4 w-4 text-ink-500" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("browse.searchPlaceholder")}
              className="h-8 w-full border-0 bg-transparent p-0 text-[13px] text-ink-800 outline-none placeholder:text-ink-400"
              aria-label={t("browse.searchPlaceholder")}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-10 rounded-[10px] border border-ink-300 bg-white px-3 text-[13px] text-ink-700 focus:border-green-800 focus:outline-none focus:ring-4 focus:ring-green-800/10"
              aria-label={t("browse.sortLabel")}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </option>
              ))}
            </select>

            <div
              role="group"
              aria-label={t("browse.changeLayout")}
              className="inline-flex items-center overflow-hidden rounded-[10px] border border-ink-300 bg-white"
            >
              <button
                type="button"
                aria-pressed={layout === "grid"}
                onClick={() => setLayout("grid")}
                className={cn(
                  "focus-ring inline-flex h-10 w-10 items-center justify-center text-ink-500 transition-colors",
                  layout === "grid" && "bg-green-800 text-white",
                )}
                aria-label={t("browse.gridView")}
              >
                <Grid3x3 className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-pressed={layout === "list"}
                onClick={() => setLayout("list")}
                className={cn(
                  "focus-ring inline-flex h-10 w-10 items-center justify-center text-ink-500 transition-colors",
                  layout === "list" && "bg-green-800 text-white",
                )}
                aria-label={t("browse.listView")}
              >
                <List className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {statusFilters.map((filter) => {
            const active = status === filter.value;
            const gold = active && filter.value === "export-ready";
            return (
              <Button
                key={filter.value}
                type="button"
                aria-pressed={active}
                variant={gold ? "secondary" : active ? "primary" : "secondary"}
                className={cn(
                  "h-8 px-3 text-[12px]",
                  gold && "!border-0 !bg-gold-400 !font-semibold !text-brand-secondaryFg hover:!bg-gold-500",
                )}
                onClick={() => setStatus(filter.value)}
              >
                {t(filter.labelKey)}
              </Button>
            );
          })}
          <span className="ml-auto self-center text-[12px] text-ink-500" aria-live="polite">
            {t("browse.listingsCount", { count: filtered.length })}
          </span>
        </div>
      </div>

      {isLoading ? (
        <Card className="rounded-[16px] p-8 text-center text-ink-500">{t("browse.loading")}</Card>
      ) : error ? (
        <Card className="rounded-[16px] p-8 text-center text-red-700">{t("browse.error")}</Card>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-300 bg-white p-12 text-center">
          <p className="text-[14px] font-semibold text-ink-800">{t("browse.emptyTitle")}</p>
          <p className="mt-1 text-[13px] text-ink-500">{t("browse.emptyHint")}</p>
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

      <MobileMarketplaceDock />
    </section>
  );
}
