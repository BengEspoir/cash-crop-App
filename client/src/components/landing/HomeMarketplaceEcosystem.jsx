"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Globe2, LineChart, Radio } from "lucide-react";
import { useListings } from "@/hooks/useListings";
import { CropCard } from "@/components/crops/CropCard";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { transitionEaseOut } from "@/lib/motion";
import { motion } from "framer-motion";

function StatBubble({ icon: Icon, label, value, hint }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={transitionEaseOut(0.32, 0.05)}
      className="rounded-2xl border border-ink-200 bg-white/90 p-4 shadow-soft backdrop-blur-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-500">{label}</p>
        {Icon ? <Icon className="h-4 w-4 text-green-700" /> : null}
      </div>
      <p className="mt-3 font-display text-[26px] leading-none text-ink-900">{value}</p>
      {hint ? <p className="mt-2 text-[12px] text-ink-500">{hint}</p> : null}
    </motion.div>
  );
}

const TESTIMONIALS = [
  {
    quote: "We shortened supplier discovery from weeks to days using verified Cameroon cooperatives.",
    name: "Logistics Coordinator",
    org: "Regional buyer cohort",
  },
  {
    quote: "Inspection-ready lots and escrow-style settlement give our procurement team operational confidence.",
    name: "Sourcing Lead",
    org: "International desk",
  },
  {
    quote: "Responders stay in one thread from RFQ to shipment — finally an ag B2B flow that feels serious.",
    name: "Export Manager",
    org: "Abidjan trade desk",
  },
];

/**
 * Live marketplace intelligence + trust narrative for the homepage.
 */
export function HomeMarketplaceEcosystem() {
  const { listings, isLoading, error } = useListings({ limit: 12 });

  const exportReady = useMemo(
    () => listings.filter((l) => l.exportReady).length,
    [listings],
  );

  const verifiedSellers = useMemo(
    () => listings.filter((l) => l.farmerVerificationStatus === "verified").length,
    [listings],
  );

  const uniqueCrops = useMemo(() => {
    const set = new Set(listings.map((l) => l.crop || l.cropName).filter(Boolean));
    return set.size;
  }, [listings]);

  return (
    <section className="space-y-6">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl space-y-2">
            <p className="section-eyebrow">Marketplace pulse</p>
            <h2 className="font-display text-[26px] leading-tight text-ink-900 md:text-[32px]">
              Live Cameroon supply with export-ready signals
            </h2>
            <p className="text-[14px] leading-relaxed text-ink-600">
              Real listings from AgriculNet — verification state, QC flags, and demand heat surfaced the same way
              international desks evaluate Alibaba-class supply.
            </p>
          </div>
          <Link
            href="/browse"
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border-transparent bg-green-800 px-5 text-[14px] font-semibold text-white shadow-[0_4px_14px_rgba(26,107,60,0.35)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-[0_6px_20px_rgba(26,107,60,0.45)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-800/15 active:scale-[0.98]"
          >
            Enter live marketplace
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </Reveal>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-[120px] animate-pulse rounded-2xl border border-ink-200 bg-gradient-to-br from-ink-100 via-ink-50 to-white"
              aria-hidden
            />
          ))}
        </div>
      ) : error ? (
        <Card className="rounded-2xl border-dashed border-amber-300 bg-amber-50 p-6 text-[14px] text-amber-950">
          Live marketplace metrics are unavailable (API unreachable). Browse may still work if the gateway recovers.
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <StatBubble
            icon={Radio}
            label="Live SKUs surfaced"
            value={String(listings.length)}
            hint={`${uniqueCrops} commodity lines in this sample`}
          />
          <StatBubble
            icon={Globe2}
            label="Export-ready mix"
            value={`${exportReady}`}
            hint="Listings flagged for international workflows"
          />
          <StatBubble
            icon={LineChart}
            label="Verified seller depth"
            value={`${verifiedSellers}`}
            hint="Seller identity cleared in this cohort"
          />
        </div>
      )}

      {!isLoading && !error && listings.length > 0 ? (
        <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" stagger={0.055}>
          {listings.slice(0, 4).map((listing) => (
            <StaggerItem key={listing.id}>
              <CropCard listing={listing} />
            </StaggerItem>
          ))}
        </Stagger>
      ) : null}

      <Reveal delay={0.08}>
        <div className="grid gap-4 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Card
              key={i}
              variant="interactive"
              className={cn("rounded-[18px] border-ink-200/90 p-5 shadow-soft", "h-full")}
            >
              <p className="text-[14px] leading-relaxed text-ink-700">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-4 text-[12px] font-semibold uppercase tracking-wide text-ink-400">
                {t.name}
                <span className="ml-2 font-normal lowercase text-ink-500">• {t.org}</span>
              </p>
            </Card>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
