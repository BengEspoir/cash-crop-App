import { Headphones, LifeBuoy, Scale, Users } from "lucide-react";
import { HeroBanner } from "../../../components/common/HeroBanner";
import { ContentSection, FeatureGrid } from "../../../components/common/ContentSection";
import { pageImagery } from "../../../lib/imagery";

const pillars = [
  { title: "Dedicated desk", body: "A multilingual trade desk helps farmers and cooperatives navigate their first few orders with ease.", icon: Headphones },
  { title: "Dispute mediation", body: "We mediate disagreements quickly with fair outcomes grounded in trade history and protected order records.", icon: Scale },
  { title: "Cooperative onboarding", body: "Structured onboarding for cooperatives covering team seats, payout allocation, and shared pipelines.", icon: Users },
  { title: "Crisis support", body: "For high-value or time-sensitive shipments, request an escalated support coordinator.", icon: LifeBuoy },
];

export default function TradeSupportPage() {
  return (
    <div className="space-y-8">
      <HeroBanner
        eyebrow="Trade Support"
        title="A partner through every trade, not just a transaction."
        description="AgriculNet&rsquo;s support team works alongside farmers, cooperatives, and buyers to keep protected orders moving even when the real world gets messy."
        image={pageImagery["trade-support"]}
        primaryAction={{ label: "Request help", href: "/contact" }}
      />

      <ContentSection eyebrow="Support Pillars" title="How we help you ship confidently">
        <FeatureGrid items={pillars} columns={4} />
      </ContentSection>
    </div>
  );
}
