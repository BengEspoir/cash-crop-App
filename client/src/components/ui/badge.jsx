"use client";

import { cn } from "../../lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

/**
 * TierBadge — Trust hierarchy badge system
 *
 * Tier 1 (Green): highest trust — verified, verified_exporter, trade_assurance
 * Tier 2 (Blue): institutional/export — export_ready, premium_supplier, fast_responder, organic_certified
 * Tier 3 (Amber): attention needed — new_seller, limited_history, pending_verification
 *
 * Also maps legacy StatusBadge values for migration compatibility.
 */

const TIER_CONFIG = {
  // Tier 1 — Green (highest trust)
  verified: {
    label: "Verified",
    tier: 1,
    dot: "bg-green-500",
    bg: "bg-green-50",
    text: "text-green-800",
    border: "border-green-200",
    ring: "ring-green-500/20",
    tooltip: "This seller has completed identity and business verification.",
  },
  verified_exporter: {
    label: "Verified Exporter",
    tier: 1,
    dot: "bg-green-500",
    bg: "bg-green-50",
    text: "text-green-800",
    border: "border-green-200",
    ring: "ring-green-500/20",
    tooltip: "Government-verified export license and documentation on file.",
  },
  trade_assurance: {
    label: "Trade Assurance",
    tier: 1,
    dot: "bg-green-500",
    bg: "bg-green-50",
    text: "text-green-800",
    border: "border-green-200",
    ring: "ring-green-500/20",
    tooltip: "Payments are held in escrow until delivery is confirmed.",
  },
  government_verified: {
    label: "Government Verified",
    tier: 1,
    dot: "bg-green-500",
    bg: "bg-green-50",
    text: "text-green-800",
    border: "border-green-200",
    ring: "ring-green-500/20",
    tooltip: "Business registration and tax ID verified with government records.",
  },

  // Tier 2 — Blue (institutional / export)
  export_ready: {
    label: "Export Ready",
    tier: 2,
    dot: "bg-blue-500",
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    ring: "ring-blue-500/20",
    tooltip: "Seller has export documentation and can fulfill international orders.",
  },
  premium_supplier: {
    label: "Premium Supplier",
    tier: 2,
    dot: "bg-blue-500",
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    ring: "ring-blue-500/20",
    tooltip: "Top 10% of sellers by volume, rating, and repeat orders.",
  },
  fast_responder: {
    label: "Fast Responder",
    tier: 2,
    dot: "bg-blue-500",
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    ring: "ring-blue-500/20",
    tooltip: "Typically responds to inquiries within 4 hours.",
  },
  organic_certified: {
    label: "Organic Certified",
    tier: 2,
    dot: "bg-blue-500",
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    ring: "ring-blue-500/20",
    tooltip: "Third-party organic certification on file.",
  },

  // Tier 3 — Amber (attention / pending)
  new_seller: {
    label: "New Seller",
    tier: 3,
    dot: "bg-amber-400",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    ring: "ring-amber-400/20",
    tooltip: "This seller is new to the platform. First orders carry buyer protection.",
  },
  limited_history: {
    label: "Limited History",
    tier: 3,
    dot: "bg-amber-400",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    ring: "ring-amber-400/20",
    tooltip: "Seller has fewer than 3 completed transactions.",
  },
  pending_verification: {
    label: "Pending Verification",
    tier: 3,
    dot: "bg-amber-400",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    ring: "ring-amber-400/20",
    tooltip: "Verification is in progress. Full details will be available soon.",
  },

  // Legacy StatusBadge compatibility
  pending: {
    label: "Pending",
    tier: 3,
    dot: "bg-amber-400",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    ring: "ring-amber-400/20",
    tooltip: "Awaiting review or approval.",
  },
  rejected: {
    label: "Rejected",
    tier: 3,
    dot: "bg-red-500",
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200",
    ring: "ring-red-500/20",
    tooltip: "This listing or account was not approved.",
  },
  "in-transit": {
    label: "In Transit",
    tier: 2,
    dot: "bg-blue-500",
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    ring: "ring-blue-500/20",
    tooltip: "Shipment is currently in transit.",
  },
  negotiable: {
    label: "Negotiable",
    tier: 2,
    dot: "bg-gold-500",
    bg: "bg-gold-50",
    text: "text-gold-800",
    border: "border-gold-200",
    ring: "ring-gold-500/20",
    tooltip: "Pricing and terms are open to negotiation.",
  },
  draft: {
    label: "Draft",
    tier: 3,
    dot: "bg-ink-400",
    bg: "bg-ink-100",
    text: "text-ink-700",
    border: "border-ink-200",
    ring: "ring-ink-400/20",
    tooltip: "This item is in draft mode and not yet published.",
  },
  active: {
    label: "Active",
    tier: 1,
    dot: "bg-green-500",
    bg: "bg-green-50",
    text: "text-green-800",
    border: "border-green-200",
    ring: "ring-green-500/20",
    tooltip: "Live and accepting inquiries.",
  },
};

const sizes = {
  sm: "px-2 py-0.5 text-[10px] gap-1",
  md: "px-2.5 py-1 text-[11px] gap-1.5",
  lg: "px-3 py-1.5 text-[12px] gap-1.5",
};

export function TierBadge({
  status = "verified",
  label,
  size = "md",
  animated = false,
  showDot = true,
  className,
}) {
  const config = TIER_CONFIG[status] || TIER_CONFIG.draft;
  const displayLabel = label || config.label;
  const isTier1 = config.tier === 1;

  const badgeContent = (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-semibold leading-none transition-all duration-enter ease-enterprise",
        sizes[size],
        config.bg,
        config.text,
        config.border,
        animated && config.ring && `ring-1 ring-inset ${config.ring}`,
        animated && "hover:-translate-y-px hover:shadow-sm motion-reduce:transform-none motion-reduce:hover:shadow-none",
        className,
      )}
    >
      {showDot && (
        <span className={cn("inline-block h-1.5 w-1.5 shrink-0 rounded-full", config.dot)} />
      )}
      {displayLabel}
    </span>
  );

  if (!config.tooltip) return badgeContent;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-help">{badgeContent}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className={cn("max-w-[220px]", config.bg, config.text)}>
          <p className="font-medium">{displayLabel}</p>
          <p className="mt-1 text-[11px] opacity-80">{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * TrustScore — A compact horizontal stack of TierBadges
 */
export function TrustScore({ badges = [], maxVisible = 3, size = "sm" }) {
  const visible = badges.slice(0, maxVisible);
  const remaining = badges.length - maxVisible;

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {visible.map((b, i) => (
        <TierBadge key={i} status={b.status} label={b.label} size={size} animated={b.animated} />
      ))}
      {remaining > 0 && (
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex cursor-help items-center rounded-full border border-ink-200 bg-ink-100 px-2 py-0.5 text-[10px] font-semibold text-ink-600">
                +{remaining}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              <div className="space-y-1">
                {badges.slice(maxVisible).map((b, i) => (
                  <p key={i} className="text-[11px]">
                    {b.label || TIER_CONFIG[b.status]?.label || b.status}
                  </p>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </span>
  );
}
