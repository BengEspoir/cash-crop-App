import { Card } from "../../../components/ui/card";
import { PageHeader } from "../../../components/common/PageHeader";
import { buildMetadata } from "../../../lib/seo";

export const metadata = buildMetadata("international");

const pillars = [
  {
    title: "Export readiness",
    detail: "AgriculNet coordinates inspections, lot notes, and packaging checkpoints before export handoff.",
  },
  {
    title: "Documentation support",
    detail: "Buyers receive a single workspace for contracts, packing lists, and inspection follow-ups.",
  },
  {
    title: "Protected settlement",
    detail: "Funds stay protected while logistics and quality milestones are confirmed.",
  },
];

export default function InternationalPage() {
  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Export Program"
        title="International trade support"
        description="This public page previews the finished export narrative for the product while the deeper operational backend remains demo-backed."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {pillars.map((pillar) => (
          <Card key={pillar.title} className="rounded-[18px] p-5">
            <h2 className="font-display text-[20px] text-[#111827]">{pillar.title}</h2>
            <p className="mt-3 body-copy">{pillar.detail}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
