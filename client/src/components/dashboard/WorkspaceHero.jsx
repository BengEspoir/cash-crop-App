"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SmartImage } from "../media/SmartImage";
import { resolveWorkspaceImagery } from "../../lib/imagery";
import { cn } from "../../lib/utils";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

/**
 * Branded ribbon hero shown at the top of a workspace dashboard.
 * Full-bleed image background with a soft green scrim, inline metrics, and
 * an optional primary call-to-action. Respects reduced-motion.
 */
export function WorkspaceHero({
  role = "farmer",
  eyebrow,
  title,
  description,
  metrics = [],
  primaryAction,
  secondaryAction,
  className,
}) {
  const imagery = resolveWorkspaceImagery(role);
  const reduce = usePrefersReducedMotion();

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[22px] border border-black/5 shadow-lift",
        className,
      )}
    >
      <div className="absolute inset-0">
        <SmartImage
          src={imagery.src}
          alt={imagery.alt}
          fill
          priority
          sizes="(min-width: 1280px) 1160px, 100vw"
          className={reduce ? undefined : "animate-ken-burns"}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/90 via-green-900/70 to-green-800/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(232,184,75,0.18),transparent_55%)]" />
      </div>

      <div className="relative flex flex-col gap-6 px-6 py-7 text-white md:px-8 md:py-8 lg:flex-row lg:items-end lg:justify-between">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl space-y-3"
        >
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-300">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="font-display text-[26px] leading-[1.15] md:text-[30px]">
            {title}
          </h1>
          {description ? (
            <p className="text-[13.5px] leading-6 text-white/85 md:text-[14px]">
              {description}
            </p>
          ) : null}

          {(primaryAction || secondaryAction) && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {primaryAction ? (
                <Link
                  href={primaryAction.href}
                  className="inline-flex items-center gap-2 rounded-[10px] bg-white px-4 py-2 text-[13px] font-semibold text-green-900 shadow-soft transition hover:bg-gold-100 hover:text-green-900"
                >
                  {primaryAction.label}
                </Link>
              ) : null}
              {secondaryAction ? (
                <Link
                  href={secondaryAction.href}
                  className="inline-flex items-center gap-2 rounded-[10px] border border-white/30 px-4 py-2 text-[13px] font-semibold text-white/95 transition hover:border-white hover:bg-white/10"
                >
                  {secondaryAction.label}
                </Link>
              ) : null}
            </div>
          )}
        </motion.div>

        {metrics.length > 0 ? (
          <div className="grid flex-1 grid-cols-2 gap-3 lg:max-w-md lg:grid-cols-3">
            {metrics.map((item, idx) => (
              <motion.div
                key={item.label}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={reduce ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-[14px] border border-white/15 bg-white/10 px-3 py-3 backdrop-blur-md"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
                  {item.label}
                </p>
                <p className="mt-2 font-display text-[18px] leading-none text-white">
                  {item.value}
                </p>
                {item.caption ? (
                  <p className="mt-1.5 text-[11px] text-white/70">{item.caption}</p>
                ) : null}
              </motion.div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
