"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Award, BadgeCheck, Globe2, Lock, Ship } from "lucide-react";
import { Button } from "../ui/button";
import { SmartImage } from "../media/SmartImage";
import { Reveal, Stagger, StaggerItem } from "../motion/Reveal";
import { getHeroSlides } from "../../lib/imagery";
import { useI18n } from "../../i18n/I18nProvider";
import { easings, duration } from "../../lib/motion";
import { cn } from "../../lib/utils";

const SLIDE_MS = 6500;

export function HeroSection() {
  const { t } = useI18n();
  const slides = getHeroSlides();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const slide = slides[index] || slides[0];

  return (
    <section className="relative isolate min-h-[520px] w-full overflow-hidden bg-green-900 text-white shadow-lift lg:min-h-[560px]">
      <div className="absolute inset-0 -z-10">
        <AnimatePresence mode="sync">
          <motion.div
            key={slide?.src}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.md, ease: easings.out }}
          >
            {slide?.src ? (
              <SmartImage
                src={slide.src}
                alt={slide.alt || ""}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            ) : null}
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(13,61,34,0.92)_0%,rgba(13,61,34,0.55)_45%,rgba(13,61,34,0.35)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_12%_0%,rgba(232,184,75,0.28),transparent_58%)]" />
      </div>

      <div className="relative grid w-full gap-10 px-4 py-12 lg:grid-cols-12 lg:items-start lg:px-8 lg:py-16 xl:px-10">
        <Reveal inView={false} className="space-y-5 lg:col-span-7">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-100 backdrop-blur-sm">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold-400" />
            {t("hero.eyebrow")}
          </p>
          <div className="space-y-4">
            <h1 className="max-w-4xl font-sans text-[32px] font-bold leading-[1.1] tracking-tight text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.25)] sm:text-[40px] lg:text-[44px]">
              {t("hero.title")}
            </h1>
            <p className="max-w-2xl text-[15px] leading-7 text-white/90">{t("hero.subtitle")}</p>
          </div>
          <div className="flex flex-wrap gap-3 pt-1">
            <Button
              asChild
              variant="cta"
              size="lg"
              className="bg-green-800 text-white hover:bg-green-900"
              icon={ArrowRight}
              iconRight
            >
              <Link href="/browse">{t("common.exploreMarketplace")}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="border-0 bg-gold-400 font-semibold text-brand-secondaryFg shadow-[0_8px_24px_rgba(232,184,75,0.35)] hover:bg-gold-500"
            >
              <Link href="/sell/onboarding">{t("common.becomeSeller")}</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="text-white hover:bg-white/10 hover:text-white"
              icon={ArrowRight}
              iconRight
            >
              <Link href="/browse">{t("common.browseListings")}</Link>
            </Button>
          </div>
        </Reveal>

        <div className="flex flex-col items-end gap-4 lg:col-span-5">
          <div className="grid w-full max-w-md grid-cols-2 gap-3 sm:max-w-lg">
            <div className="glass-surface flex flex-col items-center rounded-2xl border border-white/20 p-4 text-center shadow-lift">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-400/25 ring-2 ring-gold-400/60">
                <BadgeCheck className="h-7 w-7 text-gold-300" aria-hidden />
              </span>
              <p className="mt-3 text-[13px] font-semibold text-white">{t("hero.badgeVerified")}</p>
            </div>
            <div className="glass-surface flex flex-col items-center rounded-2xl border border-white/20 p-4 text-center shadow-lift">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-400/25 ring-2 ring-gold-400/60">
                <Ship className="h-7 w-7 text-gold-300" aria-hidden />
              </span>
              <p className="mt-3 text-[13px] font-semibold text-white">{t("hero.badgeExport")}</p>
            </div>
          </div>
        </div>

        <Stagger
          className="col-span-full mt-4 grid gap-3 sm:grid-cols-3 lg:mt-8"
          delay={0.12}
          stagger={0.08}
        >
          {[
            {
              title: t("hero.cardGlobalTitle"),
              body: t("hero.cardGlobalBody"),
              icon: Globe2,
            },
            {
              title: t("hero.cardQualityTitle"),
              body: t("hero.cardQualityBody"),
              icon: Award,
            },
            {
              title: t("hero.cardSecureTitle"),
              body: t("hero.cardSecureBody"),
              icon: Lock,
            },
          ].map(({ title, body, icon: Icon }) => (
            <StaggerItem
              key={title}
              className={cn(
                "glass-surface rounded-2xl border border-white/20 p-4 text-white",
                "transition-colors duration-200 hover:border-gold-400/50 hover:bg-white/15",
              )}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-400/20 text-gold-300">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-[14px] font-semibold leading-snug">{title}</p>
                  <p className="mt-1 text-[12.5px] leading-6 text-white/85">{body}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        {slides.length > 1 ? (
          <div className="col-span-full flex justify-center gap-1.5 pb-2 lg:justify-start" aria-hidden>
            {slides.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-6 bg-gold-400" : "w-1.5 bg-white/40",
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
