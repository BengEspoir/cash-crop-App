import { BadgeCheck, FileCheck2, HandCoins, ScanSearch } from "lucide-react";
import { HeroBanner } from "../../../components/common/HeroBanner";
import { ContentSection, FeatureGrid } from "../../../components/common/ContentSection";
import { pageImagery } from "../../../lib/imagery";
import { buildMetadata } from "../../../lib/seo";

export const metadata = buildMetadata("verification");

const benefits = [
  { title: "Trusted buyer signal", body: "Verified farmers get a badge on listings, increasing buyer confidence and shortening sales cycles.", icon: BadgeCheck },
  { title: "Faster payouts", body: "Verified accounts unlock accelerated payment release windows once delivery is confirmed.", icon: HandCoins },
  { title: "Export readiness", body: "Tag lots as export-ready so international buyers can discover them in the marketplace.", icon: ScanSearch },
  { title: "Documented history", body: "Each protected order adds to your reputation score and trade history that buyers can audit.", icon: FileCheck2 },
];

const steps = [
  { title: "Submit identity documents", body: "Upload your national ID and, if applicable, cooperative membership reference." },
  { title: "Add a farm snapshot", body: "One clear photo of your farm or warehouse is enough to kick off review." },
  { title: "Complete video call", body: "Our verification officer runs a 5-minute check-in in English or French." },
  { title: "Receive verified badge", body: "Once approved, the verified badge appears on your profile and every listing you publish." },
];

export default function VerificationPage() {
  return (
    <div className="space-y-8">
      <HeroBanner
        eyebrow="Farmer Verification"
        title="Earn the verified badge that buyers look for."
        description="Verification signals to buyers that your farm, cooperative, or aggregator is a reliable trading partner backed by AgriculNet checks."
        image={pageImagery.verification}
        primaryAction={{ label: "Start seller onboarding", href: "/sell/onboarding" }}
        secondaryAction={{ label: "See verified listings", href: "/browse" }}
      />

      <ContentSection eyebrow="Why verify" title="What the badge unlocks">
        <FeatureGrid items={benefits} columns={4} />
      </ContentSection>

      <ContentSection eyebrow="Process" title="How verification works">
        <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, idx) => (
            <li key={step.title} className="rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-100 font-display text-[14px] text-green-800">
                {idx + 1}
              </span>
              <h3 className="mt-3 font-display text-[17px] leading-[1.25] text-ink-800">{step.title}</h3>
              <p className="mt-2 text-[13px] leading-6 text-ink-700">{step.body}</p>
            </li>
          ))}
        </ol>
      </ContentSection>
    </div>
  );
}
