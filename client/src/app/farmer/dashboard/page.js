"use client";

import Link from "next/link";
import { ArrowUpRight, BadgeCheck, CheckCircle2, CircleDollarSign, Leaf, Package, TrendingUp } from "lucide-react";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { EarningsChart } from "@/components/dashboard/EarningsChart";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { WorkspaceHero } from "@/components/dashboard/WorkspaceHero";
import { CropCard } from "@/components/crops/CropCard";
import { OrderCard } from "@/components/orders/OrderCard";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Card } from "@/components/ui/card";
import { demoListings, demoNotifications, demoOrders, farmerDashboardStats } from "@/lib/demo-data";

const kpiIcons = [Package, CircleDollarSign, BadgeCheck];
const kpiAccents = ["green", "gold", "green"];

const performanceSeries = [
  { label: "Mon", value: 24, displayValue: "XAF 1.2M", caption: "Released", summary: "Cocoa releases opened the week with protected settlement on track." },
  { label: "Tue", value: 31, displayValue: "XAF 1.6M", caption: "Released", summary: "Buyer follow-ups lifted Arabica and plantain dispatch readiness." },
  { label: "Wed", value: 27, displayValue: "XAF 1.4M", caption: "Released", summary: "Inspection re-checks balanced output mid-week." },
  { label: "Thu", value: 36, displayValue: "XAF 1.9M", caption: "Released", summary: "Export-ready lots lifted the average payout volume." },
  { label: "Fri", value: 42, displayValue: "XAF 2.3M", caption: "Released", summary: "End-of-week releases produced the highest protected payout." },
];

export default function FarmerDashboardPage() {
  return (
    <section className="space-y-6">
      <WorkspaceHero
        role="farmer"
        eyebrow="Farmer workspace"
        title="Manage listings, payouts, and buyer readiness"
        description="Track inventory movement, buyer follow-ups, and settlement status from one protected view."
        metrics={[
          { label: "Active listings", value: "6", caption: "3 export-ready" },
          { label: "Open orders", value: "4", caption: "2 awaiting dispatch" },
          { label: "This week", value: "XAF 8.4M", caption: "Released payouts" },
        ]}
        primaryAction={{ label: "Create listing", href: "/farmer/listings/new" }}
        secondaryAction={{ label: "Manage inventory", href: "/farmer/listings" }}
      />

      <Stagger className="grid gap-4 md:grid-cols-3">
        {farmerDashboardStats.map((item, idx) => (
          <StaggerItem key={item.label}>
            <KpiCard
              {...item}
              icon={kpiIcons[idx] ?? Leaf}
              accent={kpiAccents[idx] ?? "green"}
              trend="up"
            />
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal>
        <EarningsChart title="Protected payout trend" items={performanceSeries} />
      </Reveal>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Reveal>
          <Card className="rounded-[18px] p-5 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="section-eyebrow">Active inventory</p>
                <h2 className="mt-2 font-display text-[22px] text-ink-900">Listings in market view</h2>
              </div>
              <Link
                href="/farmer/listings"
                className="inline-flex items-center gap-2 text-[13px] font-semibold text-green-800 hover:text-green-700"
              >
                Manage all
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <Stagger className="mt-4 grid gap-4 lg:grid-cols-2">
              {demoListings.slice(0, 4).map((listing) => (
                <StaggerItem key={listing.id}>
                  <CropCard listing={listing} href={`/farmer/listings/${listing.id}`} />
                </StaggerItem>
              ))}
            </Stagger>
          </Card>
        </Reveal>

        <Reveal delay={0.1}>
          <ActivityFeed items={demoNotifications} />
        </Reveal>
      </div>

      <Reveal>
        <Card className="rounded-[18px] p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-eyebrow">Buyer demand</p>
              <h2 className="mt-2 font-display text-[22px] text-ink-900">Orders requiring attention</h2>
            </div>
            <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-green-700">
              <TrendingUp className="h-3.5 w-3.5" /> 3 of 4 on track
            </span>
          </div>
          <Stagger className="mt-4 grid gap-4">
            {demoOrders.slice(0, 3).map((order) => (
              <StaggerItem key={order.id}>
                <OrderCard order={order} href={`/farmer/orders/${order.id}`} />
              </StaggerItem>
            ))}
          </Stagger>

          <div className="mt-5 rounded-[14px] border border-green-100 bg-green-50/70 px-4 py-3">
            <p className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-green-800">
              <CheckCircle2 className="h-4 w-4" /> Protection tip
            </p>
            <p className="mt-1 text-[12.5px] text-ink-700">
              Keep dispatch notes up to date — buyers see the same timeline on their side and approvals
              move faster when ETAs are current.
            </p>
          </div>
        </Card>
      </Reveal>
    </section>
  );
}
