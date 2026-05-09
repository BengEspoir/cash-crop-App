"use client";

import Link from "next/link";
import { ArrowRight, Store, Sprout, Truck } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Reveal, Stagger, StaggerItem } from "../../../components/motion/Reveal";

const options = [
  {
    title: "Register as Farmer",
    body: "List crops, manage buyer requests, and receive protected payouts through structured onboarding.",
    href: "/register/farmer",
    icon: Sprout,
    accent: "from-green-800/10 to-green-800/0 border-t-[4px] border-t-green-800",
    pill: "Farmer",
  },
  {
    title: "Register as Reseller",
    body: "Aggregate crop supply, publish listings, and complete the same protected verification flow before transactions.",
    href: "/register/reseller",
    icon: Store,
    accent: "from-green-700/10 to-green-700/0 border-t-[4px] border-t-green-700",
    pill: "Reseller",
  },
  {
    title: "Register as Buyer",
    body: "Browse verified supply, request quotes, and track orders with clearer trade visibility.",
    href: "/register/buyer",
    icon: Truck,
    accent: "from-gold-700/10 to-gold-700/0 border-t-[4px] border-t-gold-700",
    pill: "Buyer",
  },
];

export default function RegisterPage() {
  return (
    <Card elevated className="rounded-[22px] p-6 sm:p-8">
      <Reveal inView={false}>
        <p className="section-eyebrow">Choose Your Role</p>
        <h1 className="mt-2 font-display text-[24px] leading-[1.15] text-ink-800">
          Start with the account that matches your trade flow.
        </h1>
        <p className="mt-3 text-[14px] leading-6 text-ink-700">
          Pick the onboarding path that best fits the way you sell or source crops on AgriculNet.
        </p>
      </Reveal>

      <Stagger className="mt-6 grid gap-4 lg:grid-cols-3" delay={0.1} stagger={0.1}>
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <StaggerItem key={option.title}>
              <Link
                href={option.href}
                className={`group relative block h-full overflow-hidden rounded-2xl border border-ink-200 bg-white p-5 transition-all duration-200 hover:-translate-y-[2px] hover:border-green-800 hover:shadow-glow ${option.accent}`}
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${option.accent.replace(
                    "border-t-[4px] border-t-green-800",
                    "",
                  ).replace("border-t-[4px] border-t-gold-700", "")} opacity-0 transition-opacity duration-200 group-hover:opacity-100`}
                />
                <div className="relative flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-ink-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-700">
                      <Icon className="h-3.5 w-3.5" />
                      {option.pill}
                    </span>
                    <h2 className="mt-3 font-display text-[22px] leading-[1.15] text-ink-800">
                      {option.title}
                    </h2>
                    <p className="mt-3 text-[14px] leading-6 text-ink-700">{option.body}</p>
                  </div>
                </div>
                <div className="mt-5 inline-flex items-center gap-2 text-[13px] font-semibold text-green-800 transition-transform duration-200 group-hover:translate-x-1">
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            </StaggerItem>
          );
        })}
      </Stagger>

      <Reveal inView={false} delay={0.3} className="mt-6 text-[13px] text-ink-500">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-green-800 hover:text-green-700">
          Sign in
        </Link>
      </Reveal>
    </Card>
  );
}
