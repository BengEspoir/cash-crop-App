"use client";

import { featuredFarmers } from "../../constants/crops";
import { FarmerCard } from "../farmers/FarmerCard";
import { SectionHeader } from "../common/SectionHeader";
import { Stagger, StaggerItem } from "../motion/Reveal";

export function FeaturedFarmers() {
  return (
    <section className="space-y-5">
      <SectionHeader
        eyebrow="Verified Network"
        title="Featured farmers"
        description="Meet verified sellers with consistent order history, buyer ratings, and crop readiness across the regions buyers search most often."
        actionLabel="Find farmers"
        actionHref="/find-farmers"
      />

      <Stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" stagger={0.05}>
        {featuredFarmers.map((farmer) => (
          <StaggerItem key={farmer.name} className="h-full">
            <FarmerCard farmer={farmer} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
