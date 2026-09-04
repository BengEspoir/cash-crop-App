"use client";

import { SmartImage } from "../media/SmartImage";
import { Reveal, Stagger, StaggerItem } from "../motion/Reveal";
import { landingImagery } from "../../lib/imagery";

const methods = [
  { name: "MTN MoMo", src: "/Last-images/MTN_MOMOPAY-cartdna-shopify-featured_agjcib.webp" },
  { name: "Orange Money", src: "/Last-images/Orange-Money-logo.png" },
  { name: "Mastercard", src: "/Last-images/mastercard.jpg" },
  { name: "Flutterwave", src: "/Last-images/flutterwave.png" },
  { name: "Fapshi", src: "/Last-images/fapshi.jpg" },
  { name: "Wire Transfer", src: "/Last-images/wiretransfer.png" },
];

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
              key={method.name}
              className="glass-surface flex min-h-[78px] items-center justify-center gap-3 rounded-[12px] px-4 py-3 text-center text-[13px] font-semibold text-white transition-colors duration-200 hover:border-gold-400/60 hover:bg-white/15"
            >
              <SmartImage src={method.src} alt="" width={72} height={32} className="max-h-8 w-auto max-w-[72px] object-contain" />
              <span>{method.name}</span>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
