"use client";

import { LineChart, MessageCircle, Shield, Truck } from "lucide-react";
import { KpiCard } from "./KpiCard";

function countOpenQuotes(quotes = []) {
  return quotes.filter((q) => q?.status && !["completed", "cancelled", "rejected"].includes(q.status)).length;
}

/** Orders actively moving outside terminal states */
function countActiveFulfillment(orders = []) {
  const terminal = new Set(["completed", "cancelled", "delivered"]);
  return orders.filter((o) => o?.status && !terminal.has(o.status)).length;
}

function countShipmentMilestones(orders = []) {
  const mid = new Set(["confirmed", "processing", "packed", "ready_for_pickup", "shipped", "in_transit"]);
  return orders.filter((o) => mid.has(o?.status)).length;
}

/**
 * Operational snapshot widgets — Alibaba-style modular strip for workspaces.
 */
export function DashboardOperationsRow({
  quotes = [],
  orders = [],
  exportReadyListingCount = 0,
  listingsCount = 0,
  variant,
  buyerSavedShortlist = 0,
}) {
  const negotiations = countOpenQuotes(quotes);
  const fulfillment = countActiveFulfillment(orders);
  const inMotion = countShipmentMilestones(orders);
  const exportShare =
    listingsCount > 0 ? Math.round((exportReadyListingCount / listingsCount) * 100) : 0;

  const subtitle =
    variant === "buyer"
      ? "Buyer-side RFQs / quotes synced with AgriculNet."
      : "Seller-side pipelines mirror order + quote timelines.";

  const thirdBuyer =
    typeof buyerSavedShortlist === "number" && buyerSavedShortlist >= 0
      ? {
          label: "Shortlisted supply",
          value: buyerSavedShortlist,
          delta: "Tracked ideas from marketplace browse.",
          Icon: Shield,
          trend: "neutral",
        }
      : {
          label: "Trade readiness",
          value: fulfillment,
          delta: "Open buyer-side shipments & orders.",
          Icon: LineChart,
          trend: "neutral",
        };

  const thirdSeller = {
    label: "Export listing mix",
    value: exportShare,
    delta: "% of live listings flagged export-ready",
    Icon: Shield,
    trend: "neutral",
  };

  const third = variant === "buyer" ? thirdBuyer : thirdSeller;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <KpiCard label="Negotiation desk" value={negotiations} delta={subtitle} icon={MessageCircle} accent="green" trend="neutral" />
      <KpiCard
        label="Active fulfillment"
        value={fulfillment}
        delta={`Shipment touches — ~${inMotion} milestone states`}
        icon={Truck}
        accent="gold"
        trend="neutral"
      />
      <KpiCard label={third.label} value={third.value} delta={third.delta} icon={third.Icon} accent="green" trend={third.trend} />
    </div>
  );
}
