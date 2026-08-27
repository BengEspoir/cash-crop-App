"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CreditCard,
  Heart,
  MessageSquare,
  Package,
  Search,
  ShieldCheck,
  ShoppingBasket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CropCard } from "@/components/crops/CropCard";
import {
  WorkspaceButton,
  WorkspaceEmptyState,
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

export function buyerInitials(user, fallback = "BY") {
  return workspaceInitials(user, fallback);
}

export function buyerDisplayName(user, fallback = "Buyer") {
  return workspaceDisplayName(user, fallback);
}

export function formatBuyerDate(value) {
  return formatWorkspaceDate(value);
}

export function compactBuyerCurrency(value) {
  return compactWorkspaceCurrency(value);
}

export function BuyerPage({ children, className }) {
  return <WorkspacePage className={className}>{children}</WorkspacePage>;
}

export function BuyerHeader({ title, description, action }) {
  return <WorkspaceHeader title={title} description={description} action={action} />;
}

export function BuyerButton({ href, children, variant = "primary", icon: Icon, className, disabled, ...props }) {
  return (
    <WorkspaceButton
      href={href}
      variant={variant}
      icon={Icon}
      className={className}
      disabled={disabled}
      {...props}
    >
      {children}
    </WorkspaceButton>
  );
}

const buyerMetricTones = {
  green: "bg-green-50 text-green-800",
  blue: "bg-cyan-50 text-cyan-800",
  gold: "bg-amber-50 text-amber-800",
  neutral: "bg-ink-50 text-ink-600",
};

export function BuyerMetricCard({ icon: Icon = Package, value, label, detail, tag, tone = "green" }) {
  return (
    <WorkspaceMetricCard
      icon={Icon}
      value={value}
      label={label}
      detail={detail}
      tag={tag}
      tone={tone}
      toneClasses={buyerMetricTones}
      tagClassName="bg-amber-50 text-amber-800"
      valueClassName="font-bold"
    />
  );
}

export function BuyerPanel({ title, action, children, className, bodyClassName }) {
  return <WorkspacePanel title={title} action={action} className={className} bodyClassName={bodyClassName}>{children}</WorkspacePanel>;
}

export function BuyerStatusBadge({ status = "pending", children, className }) {
  return (
    <WorkspaceStatusBadge
      status={status}
      className={className}
      terms={{
        positive: ["verified", "delivered", "complete"],
        informational: ["transit", "escrow"],
        negative: ["cancel", "reject"],
      }}
    >
      {children}
    </WorkspaceStatusBadge>
  );
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
  return <WorkspaceEmptyState icon={ShoppingBasket} title={title} description={description} action={action} />;
}

export function BuyerBrowseCard({ listing }) {
  return <CropCard listing={listing} />;
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
