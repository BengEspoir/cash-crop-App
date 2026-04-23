"use client";

import { Button } from "../ui/button";
import { SmartImage } from "../media/SmartImage";
import { Reveal, Stagger, StaggerItem } from "../motion/Reveal";
import { landingImagery } from "../../lib/imagery";

const steps = [
  { step: "01", title: "Create a verified profile", copy: "Farmers and buyers submit the details needed for a protected marketplace presence." },
  { step: "02", title: "Browse or request a quote", copy: "Buyers search by crop, region, readiness, and sourcing needs before they engage." },
  { step: "03", title: "Confirm inspection and payment", copy: "Protected payment rails and document checks reduce risk before dispatch." },
  { step: "04", title: "Track the order to completion", copy: "AgriculNet supports handoff, logistics visibility, and dispute coordination." },
];

export function HowItWorks() {
  return (
    <section className="grid gap-5 lg:grid-cols-12 lg:items-start">
      <Reveal className="relative isolate flex flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-soft lg:col-span-4">
        <div className="relative h-[160px] w-full overflow-hidden">
          <SmartImage
            src={landingImagery.howItWorks.src}
            alt={landingImagery.howItWorks.alt}
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        </div>
        <div className="p-6">
          <p className="section-eyebrow">How It Works</p>
          <h2 className="mt-2 font-display text-[24px] leading-[1.15] text-ink-800">
            A clearer trade journey from inquiry to delivery.
          </h2>
          <p className="mt-3 text-[14px] leading-6 text-ink-700">
            The workflow is built for structured onboarding, verified supply, protected order handling, and better visibility through each trade stage.
          </p>
          <Button variant="outline" className="mt-5">Start onboarding</Button>
        </div>
      </Reveal>

      <Stagger className="grid gap-4 sm:grid-cols-2 lg:col-span-8" stagger={0.08}>
        {steps.map((step) => (
          <StaggerItem
            key={step.step}
            className="group rounded-2xl border border-ink-200 bg-white p-5 shadow-soft transition-all duration-200 hover:-translate-y-[2px] hover:border-green-800 hover:shadow-glow"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-[12px] font-semibold text-green-800 transition-colors group-hover:bg-green-800 group-hover:text-white">
              {step.step}
            </span>
            <h3 className="mt-4 text-[15px] font-semibold text-ink-800">{step.title}</h3>
            <p className="mt-2 text-[13px] leading-6 text-ink-700">{step.copy}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
