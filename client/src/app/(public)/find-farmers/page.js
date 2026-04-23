import { PageHeader } from "../../../components/common/PageHeader";
import { FarmerMiniCard } from "../../../components/farmers/FarmerMiniCard";
import { demoFarmers } from "../../../lib/demo-data";
import { buildMetadata } from "../../../lib/seo";

export const metadata = buildMetadata("findFarmers");

export default function FindFarmersPage() {
  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Verified Network"
        title="Find farmers by region and crop readiness"
        description="These demo farmer profiles mirror the finished browsing experience while the deeper marketplace modules remain frontend-driven."
      />

      <div className="grid gap-4">
        {demoFarmers.map((farmer) => (
          <FarmerMiniCard key={farmer.id} farmer={farmer} />
        ))}
      </div>
    </section>
  );
}
