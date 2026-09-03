"use client";

import Link from "next/link";
import {
  BadgeCheck,
  Bell,
  Calendar,
  Check,
  Clock3,
  CreditCard,
  DollarSign,
  HelpCircle,
  Leaf,
  MapPin,
  MessageSquare,
  Package,
  Send,
  ShieldCheck,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  WorkspaceButton,
  WorkspaceEmptyState,
  WorkspaceFilters,
  WorkspaceHeader,
  WorkspaceMetricCard,
  WorkspacePage,
  WorkspacePanel,
  WorkspaceStatusBadge,
  compactWorkspaceCurrency,
  formatWorkspaceDate,
  workspaceDisplayName,
  workspaceInitials,
} from "@/components/workspace/WorkspacePrimitives";

export function farmerInitials(user, fallback = "FR") {
  return workspaceInitials(user, fallback);
}

export function farmerDisplayName(user, fallback = "Farmer") {
  return workspaceDisplayName(user, fallback);
}

export function formatShortDate(value) {
  return formatWorkspaceDate(value);
}

export function compactCurrency(value) {
  return compactWorkspaceCurrency(value);
}

export function FarmerPage({ children, className }) {
  return <WorkspacePage className={className}>{children}</WorkspacePage>;
}

export function FarmerHeader({ title, description, action, backHref, backLabel = "Back" }) {
  return (
    <WorkspaceHeader
      title={title}
      description={description}
      action={action}
      backHref={backHref}
      backLabel={backLabel}
      titleWeightClassName="font-semibold"
    />
  );
}

export function FarmerButton({ href, children, variant = "primary", icon: Icon, className, disabled, ...props }) {
  return (
    <WorkspaceButton href={href} variant={variant} icon={Icon} className={className} disabled={disabled} {...props}>
      {children}
    </WorkspaceButton>
  );
}

export function FarmerPanel({ title, action, children, className, bodyClassName }) {
  return <WorkspacePanel title={title} action={action} className={className} bodyClassName={bodyClassName}>{children}</WorkspacePanel>;
}

const iconTone = {
  green: "bg-green-50 text-green-800",
  blue: "bg-sky-50 text-sky-800",
  gold: "bg-amber-50 text-amber-700",
  cyan: "bg-cyan-50 text-cyan-800",
};

export function FarmerMetricCard({ icon: Icon = Leaf, value, label, detail, tag, tone = "green" }) {
  return (
    <WorkspaceMetricCard icon={Icon} value={value} label={label} detail={detail} tag={tag} tone={tone} toneClasses={iconTone} valueClassName="font-medium" />
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
    <WorkspaceFilters
      searchPlaceholder={searchPlaceholder}
      filterOptions={selectFilters}
      values={values}
      onChange={onChange}
      actions={(
        <>
          {onReset ? <FarmerButton variant="outline" onClick={onReset}>Reset</FarmerButton> : null}
          {onExport ? <FarmerButton variant="gold" onClick={onExport} disabled={isExporting}>{isExporting ? "Exporting..." : "Export CSV"}</FarmerButton> : null}
        </>
      )}
    />
  );
}

export function FarmerStatusBadge({ status = "pending", children, className }) {
  return (
    <WorkspaceStatusBadge
      status={status}
      className={className}
      terms={{
        positive: ["active", "verified", "released", "delivered"],
        informational: ["transit", "escrow"],
        negative: ["cancel", "reject"],
        classes: { informational: "bg-sky-50 text-sky-800" },
      }}
    >
      {children}
    </WorkspaceStatusBadge>
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
    <WorkspaceEmptyState
      icon={Leaf}
      title={title}
      description={description}
      action={action}
      className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 transition-colors duration-200 hover:border-green-200 hover:bg-green-50/30"
      titleFontClassName="font-display"
    />
  );
}

export const farmerHelpCategories = [
  { title: "Getting Started", description: "Set up your farm profile, complete verification, and navigate the dashboard.", icon: HelpCircle },
  { title: "Managing Listings", description: "Add, edit, or remove crop listings while keeping buyer-facing details current.", icon: Leaf },
  { title: "Payments & Earnings", description: "Understand payout status, payment holds, and settlement methods.", icon: WalletCards },
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
