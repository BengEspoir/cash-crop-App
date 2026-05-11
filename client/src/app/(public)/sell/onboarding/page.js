"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, Sprout, Store } from "lucide-react";
import { PageHeader } from "../../../../components/common/PageHeader";
import { Card } from "../../../../components/ui/card";
import { Reveal, Stagger, StaggerItem } from "../../../../components/motion/Reveal";

const options = [
  {
    title: "Farmer onboarding",
    body: "List your crop supply, submit ID verification, and get paid through protected settlements after delivery confirmation.",
    href: "/register/farmer",
    icon: Sprout,
    accent: "border-t-[4px] border-t-green-800",
    pill: "Primary producer",
  },
  {
    title: "Reseller onboarding",
    body: "Aggregate supply across cooperatives, publish lots at scale, and run the same verification gates buyers expect.",
    href: "/register/reseller",
    icon: Store,
    accent: "border-t-[4px] border-t-gold-700",
    pill: "Aggregator",
  },
];

const SELLER_COOKIE = "agriculnet_seller_intent=1; Path=/; Max-Age=3600; SameSite=Lax";

export default function SellerOnboardingChooserPage() {
  useEffect(() => {
    document.cookie = SELLER_COOKIE;
  }, []);

  return (
    <section className="space-y-6">
      <Reveal inView={false}>
        <PageHeader
          eyebrow="Sell on AgriculNet"
          title="Choose your seller onboarding path"
          description="A professional onboarding flow designed for verified, export-ready agricultural trade. You’ll submit identity evidence before accepting protected orders."
          actions={(
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 rounded-[10px] border border-ink-200 bg-white px-4 py-2 text-[13px] font-semibold text-ink-700 transition-colors hover:border-green-200 hover:bg-green-50/60 hover:text-green-800"
            >
              View live listings
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        />
      </Reveal>

      <Stagger className="grid gap-4 lg:grid-cols-2" delay={0.08} stagger={0.08}>
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <StaggerItem key={option.title}>
              <Card variant="interactive" className={`rounded-[20px] p-0 ${option.accent}`}>
                <Link href={option.href} className="block p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-ink-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-700">
                        <Icon className="h-3.5 w-3.5" />
                        {option.pill}
                      </span>
                      <h2 className="font-display text-[24px] leading-[1.15] text-ink-900">
                        {option.title}
                      </h2>
                      <p className="max-w-xl text-[14px] leading-6 text-ink-700">
                        {option.body}
                      </p>
                    </div>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-ink-200 bg-white text-green-800 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-soft">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="mt-5 inline-flex items-center gap-2 text-[13px] font-semibold text-green-800">
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              </Card>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}

