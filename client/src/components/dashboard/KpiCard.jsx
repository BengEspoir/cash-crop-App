import { TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "../ui/card";
import { CountUp } from "../motion/CountUp";
import { cn } from "../../lib/utils";

/**
 * KPI card with optional icon, trend tone, and caption.
 *
 * Props
 *  - label: uppercase eyebrow
 *  - value: main number / headline (number for CountUp, string for literal)
 *  - delta: supporting string (e.g. "+12% this week")
 *  - trend: "up" | "down" | "neutral" — drives accent colour + icon
 *  - icon: lucide icon component
 *  - accent: optional tone hint — "green" (default) | "gold" | "ink"
 */
export function KpiCard({ label, value, delta, trend = "up", icon: Icon, accent = "green" }) {
  const accentClasses = {
    green: "bg-green-50 text-green-800",
    gold: "bg-gold-50 text-gold-700",
    ink: "bg-ink-100 text-ink-700",
  }[accent] ?? "bg-green-50 text-green-800";

  const trendTone = {
    up: "text-green-700",
    down: "text-red-600",
    neutral: "text-ink-500",
  }[trend] ?? "text-green-700";

  const TrendIcon = trend === "down" ? TrendingDown : TrendingUp;
  const numericValue = typeof value === "string" ? parseFloat(value.replace(/[^0-9.]/g, "")) : value;
  const isNumeric = !isNaN(numericValue) && numericValue !== 0;
  const prefix = typeof value === "string" && value.startsWith("XAF") ? "XAF " : "";
  const suffix = typeof value === "string" && value.includes("+") ? "+" : "";

  return (
    <Card variant="interactive" className="rounded-[16px] p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
          {label}
        </p>
        {Icon ? (
          <span className={cn("inline-flex h-9 w-9 items-center justify-center rounded-[10px] transition-colors duration-200", accentClasses)}>
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-display text-[28px] leading-none text-ink-900">
        {isNumeric ? (
          <CountUp end={numericValue} prefix={prefix} suffix={suffix} />
        ) : (
          value
        )}
      </p>
      {delta ? (
        <p className={cn("mt-3 inline-flex items-center gap-1 text-[12px] font-medium", trendTone)}>
          {trend !== "neutral" ? <TrendIcon className="h-3.5 w-3.5" /> : null}
          <span>{delta}</span>
        </p>
      ) : null}
    </Card>
  );
}
