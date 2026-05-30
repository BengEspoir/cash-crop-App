"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SmartImage } from "@/components/media/SmartImage";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import { duration, easings } from "@/lib/motion";

const SLIDE_MS = 6000;

export function AnimatedPageHero({
  eyebrow,
  title,
  description,
  slides = [],
  primaryAction,
  secondaryAction,
  className,
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const id = window.setInterval(() => setIndex((current) => (current + 1) % slides.length), SLIDE_MS);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const active = slides[index] || slides[0];

  return (
    <section className={cn("relative isolate overflow-hidden rounded-[28px] bg-green-950 text-white shadow-lift", className)}>
      <div className="absolute inset-0 -z-10">
        <AnimatePresence mode="sync">
          <motion.div
            key={active?.src}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.md, ease: easings.out }}
          >
            {active?.src ? (
              <SmartImage src={active.src} alt={active.alt || ""} fill priority sizes="100vw" className="object-cover" />
            ) : null}
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(8,46,28,0.92)_0%,rgba(8,46,28,0.7)_45%,rgba(8,46,28,0.45)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_100%_0%,rgba(232,184,75,0.22),transparent_60%)]" />
      </div>

      <Reveal inView={false} className="px-6 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
        <div className="max-w-3xl">
          {eyebrow ? <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-100">{eyebrow}</p> : null}
          <h1 className="mt-4 font-display text-[32px] leading-[1.06] sm:text-[42px] lg:text-[52px]">{title}</h1>
          {description ? <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/85">{description}</p> : null}
          {(primaryAction || secondaryAction) ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {primaryAction ? (
                <Button asChild className="bg-gold-400 text-ink-900 hover:bg-gold-300">
                  <Link href={primaryAction.href}>{primaryAction.label}</Link>
                </Button>
              ) : null}
              {secondaryAction ? (
                <Button asChild variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                  <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </Reveal>
    </section>
  );
}
