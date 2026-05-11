import { featuredListings } from "../../constants/crops";
import { CropCard } from "../crops/CropCard";
import { SectionHeader } from "../common/SectionHeader";
import { CategorySidebar } from "./CategorySidebar";

export function CropGrid() {
  return (
    <section className="space-y-5 rounded-[24px] border border-[#E5E7EB] bg-[#F8FBF6] p-5 shadow-[0_28px_80px_rgba(84,106,87,0.08)] animate-fade-in">
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
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-9 xl:grid-cols-4 animate-slide-up">
          {featuredListings.map((listing) => (
            <CropCard key={`${listing.crop}-${listing.location}`} listing={listing} />
          ))}
        </div>
      </div>
    </section>
  );
}
