"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { useI18n } from "../../i18n/I18nProvider";
import { cn } from "../../lib/utils";

export function HeroSearchBar() {
  const { t } = useI18n();
  const router = useRouter();
  const [q, setQ] = useState("");

  const filters = [
    { key: "verifiedOnly", param: "verified" },
    { key: "exportReady", param: "export-ready" },
    { key: "negotiable", param: "negotiable" },
    { key: "bulkOrders", param: "bulk" },
    { key: "newArrivals", param: "new" },
  ];

  const submitSearch = (e) => {
    e?.preventDefault?.();
    const query = q.trim();
    const url = query ? `/browse?query=${encodeURIComponent(query)}` : "/browse";
    router.push(url);
  };

  return (
    <section className="space-y-4 rounded-[20px] border border-[#E5E7EB] bg-white p-4 lg:p-5">
      <form
        className="flex flex-col gap-3 rounded-full border border-[#D1D5DB] bg-[#F9FAFB] p-2 lg:flex-row lg:items-center"
        onSubmit={submitSearch}
        role="search"
      >
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-medium text-[#374151] lg:min-w-[180px]">
          <span>{t("heroSearch.categories")}</span>
        </div>
        <div className="flex flex-1 items-center gap-2 px-2">
          <Search className="h-4 w-4 text-[#6B7280]" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("heroSearch.placeholder")}
            className="h-10 w-full border-0 bg-transparent p-0 text-[14px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
            aria-label={t("heroSearch.placeholder")}
          />
        </div>
        <Button
          type="submit"
          className="rounded-full border-0 bg-gold-400 px-5 font-semibold text-brand-secondaryFg hover:bg-gold-500"
        >
          {t("heroSearch.submit")}
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#D1D5DB] bg-white px-3 py-1.5 text-[12px] font-medium text-[#374151]">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {t("heroSearch.filters")}
        </span>
        {filters.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() => router.push(`/browse?highlight=${encodeURIComponent(filter.param)}`)}
            className={cn(
              "rounded-full bg-[#F3F4F6] px-3 py-1.5 text-[12px] text-[#374151] transition-colors hover:bg-green-100 hover:text-green-800",
            )}
          >
            {t(`heroSearch.${filter.key}`)}
          </button>
        ))}
      </div>
    </section>
  );
}
