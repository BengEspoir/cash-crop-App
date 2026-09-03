"use client";

import { useMemo, useState } from "react";
import { featuredListings } from "../../constants/crops";
import { cropSearchOptions, matchesCrop } from "../../lib/cropSearch";
import { CropCard } from "../crops/CropCard";
import { SectionHeader } from "../common/SectionHeader";
import { CategorySidebar } from "./CategorySidebar";
import { Stagger, StaggerItem } from "../motion/Reveal";

export function CropGrid() {
  const [activeCategory, setActiveCategory] = useState("All crops");
  const visibleListings = useMemo(
    () => featuredListings.filter((listing) => matchesCrop(listing, activeCategory)),
    [activeCategory],
  );
  const counts = useMemo(
    () => Object.fromEntries(cropSearchOptions.map((category) => [
      category,
      featuredListings.filter((listing) => matchesCrop(listing, category)).length,
    ])),
    [],
  );
  const browseHref = activeCategory === "All crops"
    ? "/browse"
    : `/browse?crop=${encodeURIComponent(activeCategory)}`;

  return (
    <section className="space-y-5">
      <SectionHeader
        title="Browse active crop listings"
        description="Explore current supply from farmers and resellers across Cameroon and compare quantity, location, and trade readiness at a glance."
        actionLabel="See all crops"
        actionHref={browseHref}
      />

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <CategorySidebar activeCategory={activeCategory} counts={counts} onSelect={setActiveCategory} />
        </div>
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:col-span-9 xl:grid-cols-3" stagger={0.05}>
          {visibleListings.map((listing) => (
            <StaggerItem key={`${listing.crop}-${listing.location}`} className="h-full">
              <CropCard listing={listing} />
            </StaggerItem>
          ))}
          {!visibleListings.length ? (
            <div className="rounded-[18px] border border-dashed border-ink-200 bg-white p-8 text-center text-[14px] text-ink-500 sm:col-span-2 xl:col-span-3">
              No recent {activeCategory.toLowerCase()} listings are available in this preview. Use “See all crops” to search the full marketplace.
            </div>
          ) : null}
        </Stagger>
      </div>
    </section>
  );
}
