"use client";

import Link from "next/link";
import { Globe2, ShieldCheck, Sprout, WalletCards } from "lucide-react";
import { BrandLogo } from "../common/BrandLogo";
import { SmartImage } from "../media/SmartImage";
import { Reveal, Stagger, StaggerItem } from "../motion/Reveal";
import { cn } from "../../lib/utils";

const defaultHighlights = [
  { label: "Verified farmers", value: "340+", icon: ShieldCheck },
  { label: "Export-ready listings", value: "120", icon: Globe2 },
  { label: "Protected payment rails", value: "7", icon: WalletCards },
  { label: "Active crop categories", value: "18", icon: Sprout },
];

const defaultNotes = [
  "Protected flows for buyers and farmers",
  "Clear review steps before marketplace activation",
  "Built for Cameroonian supply and export trade",
];

/**
 * Full-bleed imagery panel used beside every auth form.
 * Image slowly ken-burns under a brand-tinted gradient for legibility.
 */
export function BrandPanel({
  eyebrow,
  title,
  subtitle,
  image,
  highlights = defaultHighlights,
  notes = defaultNotes,
}) {
  return (
    <aside className="relative isolate flex h-full min-h-[420px] flex-col justify-between overflow-hidden bg-green-900 text-white">
      {/* Image layer */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {image?.src ? (
          <div className="absolute inset-0 animate-ken-burns motion-reduce:animate-none">
            <SmartImage
              src={image.src}
              alt={image.alt ?? ""}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        ) : null}
        {/* Gradient overlays for contrast */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,61,34,0.78)_0%,rgba(13,61,34,0.55)_45%,rgba(13,61,34,0.92)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_0%_0%,rgba(232,184,75,0.18),transparent_60%)]" />
      </div>

      <div className="flex h-full flex-col justify-between gap-8 px-5 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="space-y-6">
          <Reveal inView={false} delay={0.05}>
            <Link
              href="/"
              className="inline-flex rounded-[10px] bg-white px-3 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
            >
              <BrandLogo className="h-10 w-[150px]" priority />
            </Link>
          </Reveal>

          <Reveal inView={false} delay={0.15} className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-100/90">
              {eyebrow}
            </p>
            <h1 className="font-display text-[30px] leading-[1.1] text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)] sm:text-[32px]">
              {title}
            </h1>
            <p className="max-w-[42ch] text-[14px] leading-6 text-white/88">{subtitle}</p>
            <p className="text-[12px] leading-5 text-gold-100">
              Des fermes camerounaises aux marchés du monde
            </p>
          </Reveal>

          {highlights?.length ? (
            <Stagger className="grid gap-3 sm:grid-cols-2" delay={0.25} stagger={0.08}>
              {highlights.map(({ label, value, icon: Icon }) => (
                <StaggerItem
                  key={label}
                  className={cn(
                    "rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md",
                    "transition-colors duration-200 hover:border-gold-400/60 hover:bg-white/15",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[12px] text-white/75">{label}</p>
                    {Icon ? <Icon className="h-4 w-4 text-gold-400" /> : null}
                  </div>
                  <p className="mt-3 text-[22px] font-semibold leading-none text-white">{value}</p>
                </StaggerItem>
              ))}
            </Stagger>
          ) : null}
        </div>

        {notes?.length ? (
          <Reveal
            inView={false}
            delay={0.4}
            className="space-y-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md"
          >
            {notes.map((note) => (
              <div key={note} className="flex items-start gap-3 text-[13px] text-white/88">
                <span className="mt-1.5 inline-flex h-2 w-2 rounded-full bg-gold-400" />
                <span>{note}</span>
              </div>
            ))}
          </Reveal>
        ) : null}
      </div>
    </aside>
  );
}
