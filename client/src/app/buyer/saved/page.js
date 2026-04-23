"use client";

import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterTabs } from "@/components/common/FilterTabs";
import { CropCard } from "@/components/crops/CropCard";
import { FarmerMiniCard } from "@/components/farmers/FarmerMiniCard";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { demoFarmers, demoListings } from "@/lib/demo-data";

const OPTIONS = [
  { value: "listings", label: "Listings" },
  { value: "farmers", label: "Farmers" },
];

export default function BuyerSavedPage() {
  const [tab, setTab] = useState("listings");

  const options = OPTIONS.map((opt) => ({
    ...opt,
    count: opt.value === "listings" ? demoListings.length : demoFarmers.length,
  }));

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Saved supply"
        title="Listings and farmers worth revisiting"
        description="Shortlist crops and suppliers so your protected sourcing playbook always has a warm pipeline."
      />

      <Reveal>
        <div className="rounded-[18px] border border-ink-100 bg-white p-4 shadow-soft">
          <FilterTabs options={options} value={tab} onChange={setTab} />
        </div>
      </Reveal>

      {tab === "listings" ? (
        <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {demoListings.map((listing) => (
            <StaggerItem key={listing.id}>
              <CropCard listing={listing} />
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <Stagger className="grid gap-4 lg:grid-cols-2">
          {demoFarmers.map((farmer) => (
            <StaggerItem key={farmer.id}>
              <FarmerMiniCard farmer={farmer} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </section>
  );
}
