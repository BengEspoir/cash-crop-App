import { Card } from "../../../components/ui/card";
import { PageHeader } from "../../../components/common/PageHeader";
import { buildMetadata } from "../../../lib/seo";

export const metadata = buildMetadata("buyerProtection");

const checkpoints = [
  "Identity and role verification for marketplace participants",
  "Protected payment milestones before dispatch and logistics release",
  "Inspection and document checkpoints before export or buyer pickup",
  "Dispute review workflow for delivery, packaging, or quality mismatches",
];

export default function BuyerProtectionPage() {
  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Buyer Protection"
        title="Protected sourcing designed for trust"
        description="This route rounds out the public preview by showing the safeguards that sit behind payments, inspections, and dispute handling."
      />

      <Card className="rounded-[18px] p-6">
        <div className="grid gap-4 md:grid-cols-2">
          {checkpoints.map((checkpoint) => (
            <div key={checkpoint} className="rounded-[14px] bg-[#F9FAFB] px-4 py-4 text-[14px] leading-6 text-[#374151]">
              {checkpoint}
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
