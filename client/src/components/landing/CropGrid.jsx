"use client";

import { featuredListings } from "../../constants/crops";
import { CropCard } from "../crops/CropCard";
import { SectionHeader } from "../common/SectionHeader";
import { CategorySidebar } from "./CategorySidebar";
import { Stagger, StaggerItem } from "../motion/Reveal";

export function CropGrid() {
  return (
    <section className="space-y-5">
      <SectionHeader
        eyebrow="Marketplace Supply"
        title="Browse active crop listings"
        description="Explore recent supply from verified farmers across Cameroon and compare quantity, location, and trade readiness at a glance."
        actionLabel="See all crops"
        actionHref="/browse"
      />

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <CategorySidebar />
        </div>
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:col-span-9 xl:grid-cols-4" stagger={0.05}>
          {featuredListings.map((listing) => (
            <StaggerItem key={`${listing.crop}-${listing.location}`} className="h-full">
              <CropCard listing={listing} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
