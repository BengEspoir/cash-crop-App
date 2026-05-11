"use client";

import { Star, ShieldCheck, Globe, Award } from "lucide-react";
import { cn } from "../../lib/utils";
import { TierBadge, TrustScore } from "../ui/badge";

/**
 * SellerTrustBar — Horizontal trust indicators for seller/listing cards
 * Surfaces: rating, verification status, export readiness, review count
 */
export function SellerTrustBar({
  rating = 0,
  reviewCount = 0,
  verified = false,
  exportReady = false,
  totalListings = 0,
  totalSales = 0,
  className,
  size = "sm",
  compact = false,
}) {
  const stars = Math.min(Math.round(Number(rating) || 0), 5);
  const hasReviews = reviewCount > 0;

  if (compact) {
    return (
      <span className={cn("inline-flex items-center gap-2", className)}>
        {verified && <TierBadge status="verified" size={size} />}
        {exportReady && <TierBadge status="export_ready" size={size} />}
        {hasReviews && (
          <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-ink-500">
            <Star className="h-3 w-3 fill-gold-400 text-gold-400" />
            {(Number(rating) || 0).toFixed(1)}
          </span>
        )}
      </span>
    );
  }

  const badges = [
    verified && { status: "verified", animated: true },
    exportReady && { status: "export_ready" },
    totalSales >= 10 && { status: "premium_supplier" },
    totalListings >= 5 && totalSales < 10 && { status: "fast_responder" },
    totalListings < 3 && { status: "new_seller" },
  ].filter(Boolean);

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <TrustScore badges={badges} size={size} />

      {hasReviews && (
        <div className="inline-flex items-center gap-1 rounded-md bg-ink-50 px-1.5 py-0.5 text-[11px] font-medium text-ink-600">
          <span className="inline-flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-3 w-3",
                  i < stars ? "fill-gold-400 text-gold-400" : "fill-ink-200 text-ink-200",
                )}
              />
            ))}
          </span>
          <span className="text-ink-400">({reviewCount})</span>
        </div>
      )}
    </div>
  );
}

/**
 * ExportReadinessBadge — Visual indicator for export capability
 */
export function ExportReadinessBadge({ exportReady = false, grade, className }) {
  if (!exportReady && !grade) return null;

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      {exportReady && (
        <TierBadge status="export_ready" size="sm" />
      )}
      {grade && (
        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-800">
          <Globe className="mr-1 h-3 w-3" />
          {grade}
        </span>
      )}
    </div>
  );
}

/**
 * InquiryHeat — Demand level indicator based on views + inquiries
 */
export function InquiryHeat({ viewCount = 0, inquiryCount = 0, className }) {
  const heat = viewCount + inquiryCount * 5;
  let level = "low";
  let label = "Low interest";

  if (heat >= 100) {
    level = "high";
    label = "High interest";
  } else if (heat >= 30) {
    level = "medium";
    label = "Trending";
  }

  const levelClasses = {
    low: "bg-ink-100 text-ink-500",
    medium: "bg-gold-50 text-gold-700",
    high: "bg-green-50 text-green-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
        levelClasses[level],
        className,
      )}
    >
      {level === "high" && <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />}
      {label}
    </span>
  );
}
