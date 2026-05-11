import { featuredFarmers } from "../../constants/crops";
import { FarmerCard } from "../farmers/FarmerCard";
import { SectionHeader } from "../common/SectionHeader";

export function FeaturedFarmers() {
  return (
    <section className="space-y-5 animate-fade-in">
      <SectionHeader
        eyebrow="Verified Network"
        title="Featured farmers"
        description="Meet verified sellers with consistent order history, buyer ratings, and crop readiness across the regions buyers search most often."
        actionLabel="Find farmers"
        actionHref="/find-farmers"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 animate-slide-up">
        {featuredFarmers.map((farmer) => (
          <FarmerCard key={farmer.name} farmer={farmer} />
        ))}
      </div>
    </section>
  );
}
