"use client";

import { useRouter } from "next/navigation";
import { AgriculNetSearch } from "@/components/search/AgriculNetSearch";
import { MarketplaceSearchNav } from "@/components/search/MarketplaceSearchNav";

const RESULT_KEY = "agriculnet-marketplace-search-result";

export function MarketplaceHeroSearch() {
  const router = useRouter();

  return (
    <section className="space-y-3">
      <MarketplaceSearchNav />
      <AgriculNetSearch
      compact
      onStandardSearch={query => {
        router.push(query ? `/browse?query=${encodeURIComponent(query)}` : "/browse");
      }}
      onResults={result => {
        try {
          window.sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
        } catch {
          // The result can still be rerun from the preserved search draft.
        }
        router.push("/browse?smart=1");
      }}
      />
    </section>
  );
}
