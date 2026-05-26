"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CreditCard,
  Heart,
  MapPin,
  MessageSquare,
  Package,
  Search,
  ShieldCheck,
  ShoppingBasket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SmartImage } from "@/components/media/SmartImage";
import { resolveListingImage } from "@/lib/imagery";

export function buyerInitials(user, fallback = "BY") {
  return [user?.first_name, user?.last_name]
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || fallback;
}

export function buyerDisplayName(user, fallback = "Buyer") {
  return [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.email || fallback;
}

export function formatBuyerDate(value) {
  if (!value) return "Pending";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Pending";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function compactBuyerCurrency(value) {
  if (typeof value === "string") return value;
  const amount = Number(value || 0);
  if (amount >= 1000000) return `XAF ${(amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1)}M`;
  if (amount >= 1000) return `XAF ${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
  return `XAF ${amount.toLocaleString("en-US")}`;
}

export function BuyerPage({ children, className }) {
  return <section className={cn("space-y-8", className)}>{children}</section>;
}

export function BuyerHeader({ title, description, action }) {
  return (
    <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
      <div>
        <h1 className="font-serif text-[34px] font-bold leading-tight tracking-normal text-ink-950 md:text-[42px]">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-[18px] leading-7 text-ink-500">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function BuyerButton({ href, children, variant = "primary", icon: Icon, className, disabled, ...props }) {
  const classes = cn(
    "inline-flex h-14 items-center justify-center gap-3 rounded-lg px-6 text-[16px] font-bold transition-all duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md",
    variant === "primary" && "bg-green-800 text-white hover:bg-green-900",
    variant === "gold" && "bg-amber-600 text-white hover:bg-amber-700",
    variant === "outline" && "border border-ink-200 bg-white text-ink-700 hover:border-green-700 hover:text-green-800",
    variant === "ghost" && "bg-transparent text-green-800 hover:bg-green-50",
    disabled && "pointer-events-none opacity-60",
    className,
  );
  const content = (
    <>
      {Icon ? <Icon className="h-5 w-5" /> : null}
      <span>{children}</span>
    </>
  );
  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className={classes} disabled={disabled} {...props}>
      {content}
    </button>
  );
}

const toneClasses = {
  green: "bg-green-50 text-green-800",
  blue: "bg-cyan-50 text-cyan-800",
  gold: "bg-amber-50 text-amber-800",
  neutral: "bg-ink-50 text-ink-600",
};

export function BuyerMetricCard({ icon: Icon = Package, value, label, detail, tag, tone = "green" }) {
  return (
    <article className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 rounded-2xl border border-ink-200 bg-white p-7 transition-all duration-200 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <span className={cn("inline-flex h-14 w-14 items-center justify-center rounded-xl", toneClasses[tone] || toneClasses.green)}>
          <Icon className="h-7 w-7" />
        </span>
        {tag ? <span className="rounded-full bg-amber-50 px-4 py-1.5 text-[13px] font-bold text-amber-800">{tag}</span> : null}
      </div>
      <p className="mt-7 font-serif text-[42px] font-bold leading-none tracking-normal text-ink-950">{value}</p>
      <p className="mt-3 text-[14px] font-bold uppercase tracking-[0.12em] text-ink-400">{label}</p>
      {detail ? <p className="mt-2 text-[16px] text-ink-500">{detail}</p> : null}
    </article>
  );
}

export function BuyerPanel({ title, action, children, className, bodyClassName }) {
  return (
    <section className={cn("motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 overflow-hidden rounded-2xl border border-ink-200 bg-white transition-shadow duration-200 hover:shadow-sm", className)}>
      {(title || action) ? (
        <div className="flex min-h-20 items-center justify-between gap-4 border-b border-ink-100 px-6 py-5">
          {title ? <h2 className="text-[22px] font-bold tracking-normal text-ink-950">{title}</h2> : <span />}
          {action}
        </div>
      ) : null}
      <div className={cn("p-6", bodyClassName)}>{children}</div>
    </section>
  );
}

export function BuyerStatusBadge({ status = "pending", children, className }) {
  const normalized = String(status).toLowerCase();
  const tone = normalized.includes("verified") || normalized.includes("delivered") || normalized.includes("complete")
    ? "bg-green-50 text-green-800"
    : normalized.includes("transit") || normalized.includes("escrow")
      ? "bg-cyan-50 text-cyan-800"
      : normalized.includes("cancel") || normalized.includes("reject")
        ? "bg-red-50 text-red-800"
        : "bg-amber-50 text-amber-800";
  return <span className={cn("inline-flex rounded-full px-4 py-1.5 text-[13px] font-bold", tone, className)}>{children || status}</span>;
}

const orderSteps = ["Inquiry", "Confirmed", "Payment", "In Transit", "Delivered"];

export function BuyerOrderSummary({ order }) {
  const statusText = String(order.status || "").toLowerCase();
  const statusIndex = orderSteps.findIndex((step) => statusText.includes(step.toLowerCase().split(" ")[0]));
  const completedIndex = Math.max(0, statusIndex === -1 ? 1 : statusIndex);
  return (
    <article className="border-b border-ink-100 px-6 py-6 last:border-b-0">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-4">
          <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-cyan-700 text-[17px] font-bold text-white">
            {(order.farmerName || "FR").slice(0, 2).toUpperCase()}
          </span>
          <div>
            <p className="text-[15px] font-semibold text-ink-400">{order.id} - {formatBuyerDate(order.createdAt)}</p>
            <h3 className="mt-2 text-[19px] font-bold text-ink-950">{order.farmerName || "Farmer"} - {order.location || "Cameroon"}</h3>
            <p className="mt-1 text-[17px] text-ink-600">{order.crop} - {order.quantity}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[21px] font-bold text-green-800">{order.amountLabel}</p>
          <BuyerStatusBadge status={order.status} className="mt-2" />
        </div>
      </div>
      <div className="mt-8 grid grid-cols-5 gap-2">
        {orderSteps.map((step, index) => {
          const done = index <= completedIndex;
          return (
            <div key={step} className="text-center">
              <div className="flex items-center">
                <span className={cn("inline-flex h-9 w-9 items-center justify-center rounded-full border-2", done ? "border-green-800 bg-green-800 text-white" : "border-ink-200 bg-white text-ink-300")}>
                  {done ? <Check className="h-4 w-4" /> : null}
                </span>
                {index < orderSteps.length - 1 ? <span className={cn("h-1 flex-1", index < completedIndex ? "bg-green-800" : "bg-ink-200")} /> : null}
              </div>
              <p className={cn("mt-2 text-[13px] font-bold", done ? "text-green-800" : "text-ink-400")}>{step}</p>
            </div>
          );
        })}
      </div>
    </article>
  );
}

export function BuyerConversationPreview({ conversation }) {
  return (
    <Link href={`/buyer/messages/${conversation.id}`} className="flex gap-4 border-b border-ink-100 px-6 py-5 transition-colors hover:bg-green-50/50 last:border-b-0">
      <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-800 text-[17px] font-bold text-white">
        {(conversation.participant || "FR").slice(0, 2).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex justify-between gap-3">
          <p className="truncate text-[18px] font-bold text-ink-950">{conversation.participant}</p>
          <p className="text-[13px] text-ink-400">{formatBuyerDate(conversation.lastMessageAt || conversation.createdAt)}</p>
        </div>
        <p className="mt-1 truncate text-[16px] text-ink-500">{conversation.preview}</p>
        {conversation.listingId ? <BuyerStatusBadge status="verified" className="mt-2">Crop conversation</BuyerStatusBadge> : null}
      </div>
    </Link>
  );
}

export function BuyerEmptyState({ title, description, action }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-white px-6 py-10 text-center">
      <ShoppingBasket className="h-12 w-12 text-ink-300" />
      <h3 className="mt-4 text-[20px] font-bold text-ink-950">{title}</h3>
      {description ? <p className="mt-2 max-w-lg text-[15px] leading-6 text-ink-500">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function BuyerBrowseCard({ listing }) {
  const image = resolveListingImage(listing);
  return (
    <article className="group overflow-hidden rounded-2xl border border-ink-200 bg-white transition-all duration-200 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lg">
      <div className="relative h-52 overflow-hidden bg-ink-100">
        <SmartImage src={image} alt={listing.crop} fill sizes="(min-width: 1280px) 30vw, (min-width: 768px) 50vw, 100vw" fallbackClassName={listing.imageClass} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        <div className="absolute right-4 top-4 flex flex-wrap justify-end gap-2">
          {listing.exportReady ? <BuyerStatusBadge status="transit">Export-ready</BuyerStatusBadge> : null}
          {listing.farmerVerificationStatus === "verified" ? <BuyerStatusBadge status="verified">Verified</BuyerStatusBadge> : null}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-[21px] font-bold text-ink-950 transition-colors group-hover:text-green-800">{listing.crop}</h3>
        <p className="mt-2 inline-flex items-center gap-1.5 text-[15px] leading-6 text-ink-500">
          <MapPin className="h-4 w-4" />
          {listing.location} - {listing.quantityLabel || listing.quantity}
        </p>
        <div className="mt-6 flex items-end justify-between gap-4 border-t border-ink-100 pt-5">
          <div>
            <p className="text-[24px] font-bold text-green-800">{listing.price?.split("/")[0] || listing.price}</p>
            <p className="text-[14px] text-ink-500">per {listing.price?.split("/")[1]?.trim() || "unit"}</p>
          </div>
          <BuyerButton href={`/crops/${listing.id}`} className="h-12 px-5">View Details</BuyerButton>
        </div>
      </div>
    </article>
  );
}

export const buyerMetricIcons = {
  orders: Package,
  saved: Heart,
  messages: MessageSquare,
  sourced: CreditCard,
  verified: BadgeCheck,
  shield: ShieldCheck,
  search: Search,
};
