"use client";

import { SmartImage } from "../media/SmartImage";
import { Reveal, Stagger, StaggerItem } from "../motion/Reveal";
import { landingImagery } from "../../lib/imagery";

const methods = ["MTN MoMo", "Orange Money", "Visa", "Mastercard", "Flutterwave", "Wire Transfer"];

export function PaymentsBanner() {
  return (
    <section className="relative isolate overflow-hidden rounded-[22px] bg-green-900 text-white shadow-lift">
      <div className="absolute inset-0 -z-10">
        <SmartImage
          src={landingImagery.paymentsBanner.src}
          alt={landingImagery.paymentsBanner.alt}
          fill
          sizes="(min-width: 1280px) 1240px, 100vw"
          className="opacity-70"
        />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(13,61,34,0.94)_0%,rgba(13,61,34,0.82)_50%,rgba(13,61,34,0.55)_100%)]" />
      </div>

      <div className="relative grid gap-6 px-5 py-10 lg:grid-cols-12 lg:items-center lg:px-8 lg:py-12">
        <Reveal className="space-y-3 lg:col-span-5">
          <p className="section-eyebrow text-gold-100">Protected Payments</p>
          <h2 className="font-display text-[26px] leading-[1.15] text-white">
            Payment flexibility built into the trade flow.
          </h2>
          <p className="text-[14px] leading-6 text-white/84">
            Support mobile money, cards, and transfer-ready settlement paths depending on buyer profile, order structure, and delivery route.
          </p>
        </Reveal>

        <Stagger className="grid gap-3 sm:grid-cols-2 lg:col-span-7 xl:grid-cols-3" stagger={0.06}>
          {methods.map((method) => (
            <StaggerItem
              key={method}
              className="glass-surface rounded-[12px] px-4 py-3 text-center text-[13px] font-semibold text-white transition-colors duration-200 hover:border-gold-400/60 hover:bg-white/15"
            >
              {method}
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
