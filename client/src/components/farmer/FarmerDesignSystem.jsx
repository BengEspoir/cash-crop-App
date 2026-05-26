"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Calendar,
  Check,
  ChevronDown,
  Clock3,
  CreditCard,
  DollarSign,
  HelpCircle,
  Leaf,
  MapPin,
  MessageSquare,
  Package,
  Search,
  Send,
  ShieldCheck,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function farmerInitials(user, fallback = "FR") {
  return [user?.first_name, user?.last_name]
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || fallback;
}

export function farmerDisplayName(user, fallback = "Farmer") {
  return [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.email || fallback;
}

export function formatShortDate(value) {
  if (!value) return "Pending";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Pending";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function compactCurrency(value) {
  if (typeof value === "string") return value;
  const amount = Number(value || 0);
  if (amount >= 1000000) return `XAF ${(amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1)}M`;
  if (amount >= 1000) return `XAF ${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
  return `XAF ${amount.toLocaleString("en-US")}`;
}

export function FarmerPage({ children, className }) {
  return <section className={cn("space-y-8", className)}>{children}</section>;
}

export function FarmerHeader({ title, description, action, backHref, backLabel = "Back" }) {
  return (
    <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
      <div className="min-w-0">
        {backHref ? (
          <Link href={backHref} className="focus-ring mb-5 inline-flex items-center gap-2 rounded-md text-[15px] font-medium text-ink-500 transition-all duration-200 hover:text-green-800 motion-safe:hover:-translate-x-0.5">
            <ArrowRight className="h-4 w-4 rotate-180" />
            {backLabel}
          </Link>
        ) : null}
        <h1 className="font-display text-[34px] font-semibold leading-tight tracking-normal text-ink-950 md:text-[42px]">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-[18px] leading-7 text-ink-500">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function FarmerButton({ href, children, variant = "primary", icon: Icon, className, disabled, ...props }) {
  const content = (
    <>
      {Icon ? <Icon className="h-5 w-5" /> : null}
      <span>{children}</span>
    </>
  );
  const classes = cn(
    "focus-ring inline-flex h-14 items-center justify-center gap-3 rounded-lg px-6 text-[16px] font-bold transition-all duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md",
    variant === "primary" && "bg-green-800 text-white hover:bg-green-900",
    variant === "gold" && "bg-amber-600 text-white hover:bg-amber-700",
    variant === "outline" && "border border-ink-200 bg-white text-ink-700 hover:border-green-700 hover:text-green-800",
    variant === "ghost" && "bg-transparent text-green-800 hover:bg-green-50",
    disabled && "pointer-events-none opacity-60",
    className,
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

export function FarmerPanel({ title, action, children, className, bodyClassName }) {
  return (
    <section className={cn("motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 overflow-hidden rounded-2xl border border-ink-200 bg-white transition-shadow duration-200 hover:shadow-sm", className)}>
      {(title || action) ? (
        <div className="flex min-h-20 items-center justify-between gap-4 border-b border-ink-100 px-6 py-5">
          {title ? <h2 className="font-display text-[22px] font-bold tracking-normal text-ink-950">{title}</h2> : <span />}
          {action}
        </div>
      ) : null}
      <div className={cn("p-6", bodyClassName)}>{children}</div>
    </section>
  );
}

const iconTone = {
  green: "bg-green-50 text-green-800",
  blue: "bg-sky-50 text-sky-800",
  gold: "bg-amber-50 text-amber-700",
  cyan: "bg-cyan-50 text-cyan-800",
};

export function FarmerMetricCard({ icon: Icon = Leaf, value, label, detail, tag, tone = "green" }) {
  return (
    <article className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 rounded-2xl border border-ink-200 bg-white p-7 transition-all duration-200 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <span className={cn("inline-flex h-14 w-14 items-center justify-center rounded-xl", iconTone[tone] || iconTone.green)}>
          <Icon className="h-7 w-7" />
        </span>
        {tag ? <span className="rounded-full bg-green-50 px-4 py-1.5 text-[13px] font-bold text-green-800">{tag}</span> : null}
      </div>
      <p className="mt-7 font-display text-[42px] font-medium leading-none tracking-normal text-ink-950">{value}</p>
      <p className="mt-3 text-[14px] font-bold uppercase tracking-[0.12em] text-ink-400">{label}</p>
      {detail ? <p className="mt-2 text-[16px] text-ink-500">{detail}</p> : null}
    </article>
  );
}

export function FarmerTabs({ tabs = [], active = "all" }) {
  return (
    <div className="flex gap-8 overflow-x-auto border-b border-ink-200">
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            className={cn(
              "focus-ring whitespace-nowrap border-b-2 px-0 pb-5 text-[17px] font-semibold transition-colors",
              selected ? "border-green-800 text-green-800" : "border-transparent text-ink-400 hover:text-ink-700",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function FarmerFilters({ searchPlaceholder = "Search...", filters = [], filterOptions = [], values = {}, onChange, onReset, onExport, isExporting }) {
  const selectFilters = filterOptions.length
    ? filterOptions
    : filters.map((label) => ({ key: String(label).split(":")[0].trim().toLowerCase(), label, options: [{ value: "all", label }] }));

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1 lg:max-w-[420px]">
        <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
        <input
          type="search"
          placeholder={searchPlaceholder}
          value={values.q || ""}
          onChange={(event) => onChange?.("q", event.target.value)}
          className="h-14 w-full rounded-lg border border-ink-200 bg-white pl-14 pr-4 text-[16px] text-ink-800 outline-none transition focus:border-green-700 focus:ring-4 focus:ring-green-800/10"
        />
      </div>
      {selectFilters.map((filter) => (
        <label
          key={filter.key}
          className="focus-ring inline-flex h-14 items-center justify-between gap-3 rounded-lg border border-ink-200 bg-white px-5 text-[16px] font-medium text-ink-700 transition-all duration-200 hover:border-green-700 hover:text-green-800 motion-safe:hover:-translate-y-0.5"
        >
          <span className="sr-only">{filter.label}</span>
          <select
            value={values[filter.key] || "all"}
            onChange={(event) => onChange?.(filter.key, event.target.value)}
            className="h-full min-w-[130px] bg-transparent outline-none"
          >
            {(filter.options || []).map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <ChevronDown className="h-4 w-4 text-ink-400" />
        </label>
      ))}
      {onReset ? <FarmerButton variant="outline" onClick={onReset}>Reset</FarmerButton> : null}
      {onExport ? <FarmerButton variant="gold" onClick={onExport} disabled={isExporting}>{isExporting ? "Exporting..." : "Export CSV"}</FarmerButton> : null}
    </div>
  );
}

export function FarmerStatusBadge({ status = "pending", children, className }) {
  const normalized = String(status).toLowerCase();
  const tone = normalized.includes("active") || normalized.includes("verified") || normalized.includes("released") || normalized.includes("delivered")
    ? "bg-green-50 text-green-800"
    : normalized.includes("transit") || normalized.includes("escrow")
      ? "bg-sky-50 text-sky-800"
      : normalized.includes("cancel") || normalized.includes("reject")
        ? "bg-red-50 text-red-800"
        : "bg-amber-50 text-amber-800";
  return (
    <span className={cn("inline-flex rounded-full px-4 py-1.5 text-[13px] font-bold", tone, className)}>
      {children || status}
    </span>
  );
}

const cropPalette = ["bg-[#7A431F]", "bg-[#55332C]", "bg-[#C91F26]", "bg-green-700", "bg-[#70483B]", "bg-orange-600"];

export function FarmerListingTile({ listing, index = 0 }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-ink-200 bg-white transition-all duration-200 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lg">
      <div className={cn("relative flex h-44 items-center justify-center", cropPalette[index % cropPalette.length])}>
        <span className="absolute left-5 top-4 text-2xl font-bold text-white">...</span>
        <FarmerStatusBadge status={listing.status} className="absolute right-4 top-4" />
        <Leaf className="h-16 w-16 text-white" />
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[20px] font-bold text-ink-950 transition-colors group-hover:text-green-800">{listing.crop}</h3>
            <p className="mt-2 inline-flex items-center gap-1.5 text-[15px] text-ink-500">
              <MapPin className="h-4 w-4" />
              {listing.location}
            </p>
          </div>
          <FarmerStatusBadge status={listing.status}>{listing.status}</FarmerStatusBadge>
        </div>
        <div className="mt-6 grid grid-cols-3 divide-x divide-ink-100 text-center">
          <div>
            <p className="text-[20px] font-bold text-ink-950">{listing.quantity || "0 kg"}</p>
            <p className="mt-1 text-[12px] font-semibold uppercase text-ink-400">Qty</p>
          </div>
          <div>
            <p className="text-[20px] font-bold text-ink-950">{listing.price || "XAF 0"}</p>
            <p className="mt-1 text-[12px] font-semibold uppercase text-ink-400">Price</p>
          </div>
          <div>
            <p className="text-[20px] font-bold text-ink-950">{listing.viewCount || 0}</p>
            <p className="mt-1 text-[12px] font-semibold uppercase text-ink-400">Views</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-ink-50 px-3 py-1.5 text-[13px] font-medium text-ink-500">
            {listing.inquiryCount || 0} inquiries
          </span>
          <span className="rounded-full bg-ink-50 px-3 py-1.5 text-[13px] font-medium text-ink-500">
            {listing.saveCount || 0} saves
          </span>
        </div>
        <div className="mt-6 flex gap-3">
          <FarmerButton href={`/farmer/listings/${listing.id}/edit`} variant="outline" className="h-12 flex-1">Edit</FarmerButton>
          <FarmerButton href={`/farmer/listings/${listing.id}`} variant="outline" className="h-12 flex-1 border-green-800 text-green-800">View Inquiries</FarmerButton>
        </div>
      </div>
    </article>
  );
}

const orderSteps = ["Inquiry", "Confirmed", "Payment", "In Transit", "Delivered"];

export function FarmerOrderRow({ order }) {
  const statusIndex = Math.max(0, orderSteps.findIndex((step) => order.status?.toLowerCase().includes(step.toLowerCase().split(" ")[0])));
  const completedIndex = statusIndex === -1 ? 1 : statusIndex;
  return (
    <article className="overflow-hidden rounded-2xl border border-ink-200 bg-white transition-all duration-200 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-100 bg-ink-50/50 px-6 py-4">
        <p className="text-[17px] font-bold text-ink-950">{order.id} <span className="font-medium text-ink-400">- {formatShortDate(order.createdAt)}</span></p>
        <FarmerStatusBadge status={order.status} />
        <Link href={`/farmer/orders/${order.rawId || order.id}`} className="focus-ring rounded-md text-[15px] font-bold text-green-800 transition-all duration-200 hover:text-green-900 motion-safe:hover:translate-x-0.5">
          View Details
        </Link>
      </div>
      <div className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1fr)_520px]">
        <div>
          <div className="flex items-center gap-4">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-cyan-700 text-[18px] font-bold text-white">
              {(order.buyerName || "Buyer").slice(0, 2).toUpperCase()}
            </span>
            <div>
              <p className="text-[18px] font-bold text-ink-950">Buyer: {order.buyerName || "Buyer"}</p>
              <p className="mt-1 text-[15px] text-ink-500">{order.quantity} - {order.crop}</p>
            </div>
          </div>
          <p className="mt-6 text-[30px] font-bold text-ink-950">{order.amountLabel}</p>
          <p className="mt-1 text-[14px] text-ink-400">Total order value</p>
        </div>
        <div className="flex items-center">
          <div className="grid w-full grid-cols-5 gap-2">
            {orderSteps.map((step, index) => {
              const done = index <= completedIndex;
              return (
                <div key={step} className="text-center">
                  <div className="flex items-center">
                    <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-full border-2", done ? "border-green-800 bg-green-800 text-white" : "border-ink-200 bg-white text-ink-300")}>
                      {done ? <Check className="h-4 w-4" /> : null}
                    </span>
                    {index < orderSteps.length - 1 ? <span className={cn("h-1 flex-1", index < completedIndex ? "bg-green-800" : "bg-ink-200")} /> : null}
                  </div>
                  <p className={cn("mt-2 text-[13px] font-bold", done ? "text-green-800" : "text-ink-400")}>{step}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink-100 px-6 py-5">
        <div className="flex flex-wrap gap-3">
          <FarmerButton href="/farmer/messages" variant="outline" className="h-12">Message Buyer</FarmerButton>
          <FarmerButton href={`/farmer/orders/${order.rawId || order.id}`} variant="outline" className="h-12">View Shipment Docs</FarmerButton>
        </div>
        <FarmerButton href={`/farmer/orders/${order.rawId || order.id}`} className="h-12">Confirm Delivery</FarmerButton>
      </div>
    </article>
  );
}

export function FarmerNotificationItem({ item }) {
  const unread = item.status !== "verified";
  return (
    <article className={cn("relative rounded-2xl border border-ink-200 bg-white p-6 transition-all duration-200 hover:bg-green-50/40 motion-safe:hover:translate-x-1 motion-safe:hover:shadow-sm", unread && "border-l-4 border-l-green-800")}>
      <div className="flex gap-5">
        <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-cyan-800">
          {item.title?.toLowerCase().includes("payment") ? <CreditCard className="h-7 w-7" /> : <Package className="h-7 w-7" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex justify-between gap-4">
            <h3 className="text-[20px] font-bold text-ink-950">{item.title || "Notification"}</h3>
            {unread ? <span className="mt-2 h-3 w-3 rounded-full bg-green-800" /> : null}
          </div>
          <p className="mt-2 text-[17px] leading-7 text-ink-600">{item.detail || "Activity was recorded on your account."}</p>
          <p className="mt-3 text-[14px] text-ink-400">{formatShortDate(item.createdAt)}</p>
        </div>
      </div>
    </article>
  );
}

export function FarmerEmptyState({ title, description, action }) {
  return (
    <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-white px-6 py-10 text-center transition-colors duration-200 hover:border-green-200 hover:bg-green-50/30">
      <Leaf className="h-12 w-12 text-ink-300" />
      <h3 className="mt-4 text-[20px] font-bold text-ink-950">{title}</h3>
      {description ? <p className="mt-2 max-w-lg text-[15px] leading-6 text-ink-500">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export const farmerHelpCategories = [
  { title: "Getting Started", description: "Set up your farm profile, complete verification, and navigate the dashboard.", icon: HelpCircle },
  { title: "Managing Listings", description: "Add, edit, or remove crop listings while keeping buyer-facing details current.", icon: Leaf },
  { title: "Payments & Earnings", description: "Understand payout status, escrow protection, and settlement methods.", icon: WalletCards },
  { title: "Export & Logistics", description: "Review export-ready requirements, inspection notes, and shipping coordination.", icon: Package },
];

export const farmerSettingsSections = [
  { title: "Preferences", icon: TrendingUp },
  { title: "Security & Password", icon: ShieldCheck },
  { title: "Notifications", icon: Bell },
  { title: "Payout Methods", icon: CreditCard },
];

export const farmerMetricIcons = {
  listings: Leaf,
  orders: Package,
  payments: DollarSign,
  messages: MessageSquare,
  calendar: Calendar,
  waiting: Clock3,
  card: CreditCard,
  send: Send,
  verified: BadgeCheck,
};
