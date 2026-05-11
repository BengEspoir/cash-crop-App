import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { HeroBanner } from "../../../components/common/HeroBanner";
import { ContentSection } from "../../../components/common/ContentSection";
import { pageImagery } from "../../../lib/imagery";
import { cn } from "../../../lib/utils";
import { buildMetadata } from "../../../lib/seo";

export const metadata = buildMetadata("pricing");

const plans = [
  {
    name: "Grower",
    price: "Free",
    description: "For individual farmers and smallholders publishing up to 10 active listings.",
    bullets: ["Unlimited browsing", "Up to 10 listings", "Mobile money payout", "Protected order support"],
    cta: { label: "Start seller onboarding", href: "/sell/onboarding" },
  },
  {
    name: "Cooperative",
    price: "2.5%",
    priceLabel: "per protected order",
    description: "For cooperatives and aggregators coordinating multiple farmers and shipments.",
    bullets: ["Unlimited listings", "Team seats", "Inspection coordination", "Consolidated reporting"],
    highlighted: true,
    cta: { label: "Talk to us", href: "/contact" },
  },
  {
    name: "Buyer",
    price: "1%",
    priceLabel: "per protected order",
    description: "For wholesalers, processors, and exporters sourcing verified supply at scale.",
    bullets: ["Verified farmer search", "Quote workflows", "Export documentation help", "Dedicated desk"],
    cta: { label: "Register as Buyer", href: "/register/buyer" },
  },
];

export default function PricingPage() {
  return (
    <div className="space-y-8">
      <HeroBanner
        eyebrow="Pricing"
        title="Transparent fees tied to protected trade outcomes."
        description="No listing fees. No subscription. A small percentage only when a protected order is successfully paid out."
        image={pageImagery.pricing}
        primaryAction={{ label: "Register", href: "/register" }}
        secondaryAction={{ label: "Talk to our team", href: "/contact" }}
      />

      <ContentSection eyebrow="Plans" title="Pick the plan that fits your trade flow">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "flex flex-col rounded-2xl border bg-white p-6 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift",
                plan.highlighted ? "border-green-800 ring-2 ring-green-800/20" : "border-ink-200",
              )}
            >
              {plan.highlighted ? (
                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-gold-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-800">
                  Most popular
                </span>
              ) : null}
              <h3 className="mt-2 font-display text-[20px] text-ink-800">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-[32px] leading-none text-ink-800">{plan.price}</span>
                {plan.priceLabel ? (
                  <span className="text-[12px] text-ink-500">{plan.priceLabel}</span>
                ) : null}
              </div>
              <p className="mt-3 text-[13px] leading-6 text-ink-700">{plan.description}</p>
              <ul className="mt-4 space-y-2 text-[13px] text-ink-700">
                {plan.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-green-800" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Button asChild className="w-full" variant={plan.highlighted ? "primary" : "outline"}>
                  <Link href={plan.cta.href}>{plan.cta.label}</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ContentSection>

      <ContentSection eyebrow="Notes" title="Fine print">
        <ul className="space-y-2 text-[13px] leading-6 text-ink-700">
          <li>• Protected order fee is charged only on successful settlement. Cancelled or disputed orders are not charged.</li>
          <li>• Mobile money fees from providers are passed through at cost and shown before you confirm.</li>
          <li>• Enterprise pricing is available for aggregators, exporters, and institutional buyers.</li>
        </ul>
      </ContentSection>
    </div>
  );
}
