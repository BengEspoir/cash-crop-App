"use client";

import Link from "next/link";
import { ArrowRight, Globe2, ShieldCheck, Sprout, WalletCards } from "lucide-react";
import { Button } from "../ui/button";
import { SmartImage } from "../media/SmartImage";
import { Reveal, Stagger, StaggerItem } from "../motion/Reveal";
import { landingImagery } from "../../lib/imagery";

const statCards = [
  { label: "Verified farmers", value: "340+", icon: ShieldCheck },
  { label: "Export-ready listings", value: "120", icon: Globe2 },
  { label: "Protected payment rails", value: "7", icon: WalletCards },
  { label: "Active crop categories", value: "18", icon: Sprout },
];

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden rounded-[22px] bg-green-900 text-white shadow-lift">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 animate-ken-burns motion-reduce:animate-none">
          <SmartImage
            src={landingImagery.hero.src}
            alt={landingImagery.hero.alt}
            fill
            priority
            sizes="(min-width: 1280px) 1240px, 100vw"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(13,61,34,0.92)_0%,rgba(13,61,34,0.7)_45%,rgba(13,61,34,0.35)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_10%_0%,rgba(232,184,75,0.22),transparent_60%)]" />
      </div>

      <div className="relative grid gap-8 px-5 py-10 lg:grid-cols-12 lg:items-center lg:px-10 lg:py-14">
        <Reveal inView={false} className="space-y-5 lg:col-span-7">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-100 backdrop-blur-sm">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold-400" />
            Agricultural Trade Platform
          </p>
          <div className="space-y-4">
            <h1 className="max-w-3xl font-display text-[34px] leading-[1.08] text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.25)] sm:text-[42px]">
              Trusted crop trade from Cameroonian farms to local and international markets.
            </h1>
            <p className="max-w-2xl text-[15px] leading-7 text-white/88">
              Discover verified farmers, structured crop listings, protected payments, and export-ready trade support in one clear marketplace.
            </p>
            <p className="text-[12px] leading-5 text-gold-100">
              Des fermes camerounaises aux marchés du monde
            </p>
          </div>
          <div className="flex flex-wrap gap-3 pt-1">
            <Button asChild variant="secondary" className="border-white bg-white text-green-800 hover:bg-ink-50">
              <Link href="/register/farmer">Register as Farmer</Link>
            </Button>
            <Button asChild variant="outline" className="border-white bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link href="/register/buyer">Register as Buyer</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
              <Link href="/browse" className="inline-flex items-center gap-2">
                Browse listings
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Reveal>

        <Stagger className="grid gap-3 sm:grid-cols-2 lg:col-span-5" delay={0.15} stagger={0.08}>
          {statCards.map(({ label, value, icon: Icon }) => (
            <StaggerItem
              key={label}
              className="glass-surface rounded-2xl p-4 text-white transition-colors duration-200 hover:border-gold-400/60 hover:bg-white/15"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-[12px] text-white/75">{label}</p>
                <Icon className="h-4 w-4 text-gold-400" />
              </div>
              <p className="mt-3 text-[24px] font-semibold leading-none">{value}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
