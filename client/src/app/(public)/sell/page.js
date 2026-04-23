import Link from "next/link";
import { BadgeCheck, Coins, LineChart, TrendingUp } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { HeroBanner } from "../../../components/common/HeroBanner";
import { ContentSection, FeatureGrid } from "../../../components/common/ContentSection";
import { pageImagery } from "../../../lib/imagery";
import { buildMetadata } from "../../../lib/seo";

export const metadata = buildMetadata("sell");

const benefits = [
  { title: "Verified buyer demand", body: "Our buyer network is screened for payment reliability and export seriousness before they can place protected orders.", icon: BadgeCheck },
  { title: "Protected settlements", body: "Payments are held safely and released after delivery is confirmed, so you don't chase invoices.", icon: Coins },
  { title: "Transparent pricing signal", body: "See reference prices by crop and region to benchmark your listings against the market.", icon: LineChart },
  { title: "Growth support", body: "Access cooperative coaching, inspection coordination, and export readiness checklists.", icon: TrendingUp },
];

const steps = [
  { title: "Create your profile", body: "Sign up as a farmer, submit verification documents, and add your default pickup location." },
  { title: "Publish listings", body: "Upload crop photos, set quantity, readiness, and price. Mark lots as export-ready when certified." },
  { title: "Accept protected orders", body: "Review quote requests, confirm orders, coordinate inspection, then ship or hand off for pickup." },
  { title: "Get paid on release", body: "Settlement hits your linked mobile money or bank account as soon as delivery is confirmed." },
];

export default function SellPage() {
  return (
    <div className="space-y-8">
      <HeroBanner
        eyebrow="Sell on AgriculNet"
        title="Bring your crops to verified buyers across Cameroon and beyond."
        description="Publish listings in minutes, keep full control of your pricing, and get paid through protected payment rails."
        image={pageImagery.sell}
        primaryAction={{ label: "Register as Farmer", href: "/register/farmer" }}
        secondaryAction={{ label: "See live listings", href: "/browse" }}
      />

      <ContentSection
        eyebrow="Why AgriculNet"
        title="Built to make selling safer and simpler"
      >
        <FeatureGrid items={benefits} columns={4} />
      </ContentSection>

      <ContentSection eyebrow="How it works" title="Four steps from farm to payment">
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

      <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-soft sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-6">
        <div className="space-y-2">
          <p className="section-eyebrow">Ready to sell?</p>
          <h2 className="font-display text-[22px] text-ink-800">Register your farm or cooperative today.</h2>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 lg:mt-0">
          <Button asChild>
            <Link href="/register/farmer">Register as Farmer</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/pricing">See fees</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
