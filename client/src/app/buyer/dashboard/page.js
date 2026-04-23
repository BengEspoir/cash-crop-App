"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle2, ClipboardList, Package, ShoppingBasket } from "lucide-react";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { WorkspaceHero } from "@/components/dashboard/WorkspaceHero";
import { CropCard } from "@/components/crops/CropCard";
import { FarmerMiniCard } from "@/components/farmers/FarmerMiniCard";
import { OrderCard } from "@/components/orders/OrderCard";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Card } from "@/components/ui/card";
import { buyerDashboardStats, demoFarmers, demoListings, demoNotifications, demoOrders } from "@/lib/demo-data";

const kpiIcons = [Package, ShoppingBasket, ClipboardList];
const kpiAccents = ["green", "gold", "green"];

export default function BuyerDashboardPage() {
  return (
    <section className="space-y-6">
      <WorkspaceHero
        role="buyer"
        eyebrow="Buyer workspace"
        title="Track protected sourcing from one clear view"
        description="Keep quote follow-ups, saved supply, and active orders visible while you explore new farmer partners."
        metrics={[
          { label: "Active orders", value: "12", caption: "3 awaiting dispatch" },
          { label: "Saved listings", value: "18", caption: "5 export-ready" },
          { label: "Open RFQs", value: "4", caption: "2 awaiting reply" },
        ]}
        primaryAction={{ label: "Browse supply", href: "/browse" }}
        secondaryAction={{ label: "Request a quote", href: "/request-quote" }}
      />

      <Stagger className="grid gap-4 md:grid-cols-3">
        {buyerDashboardStats.map((item, idx) => (
          <StaggerItem key={item.label}>
            <KpiCard
              {...item}
              icon={kpiIcons[idx] ?? Package}
              accent={kpiAccents[idx] ?? "green"}
              trend="up"
            />
          </StaggerItem>
        ))}
      </Stagger>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Reveal>
          <Card className="rounded-[18px] p-5 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="section-eyebrow">Protected orders</p>
                <h2 className="mt-2 font-display text-[22px] text-ink-900">Priority deliveries</h2>
              </div>
              <Link
                href="/buyer/orders"
                className="inline-flex items-center gap-2 text-[13px] font-semibold text-green-800 hover:text-green-700"
              >
                View all
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <Stagger className="mt-4 grid gap-4">
              {demoOrders.slice(0, 2).map((order) => (
                <StaggerItem key={order.id}>
                  <OrderCard order={order} href={`/buyer/orders/${order.id}`} />
                </StaggerItem>
              ))}
            </Stagger>
          </Card>
        </Reveal>

        <Reveal delay={0.08}>
          <ActivityFeed items={demoNotifications} />
        </Reveal>
      </div>

      <Reveal>
        <Card className="rounded-[18px] p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-eyebrow">Marketplace ideas</p>
              <h2 className="mt-2 font-display text-[22px] text-ink-900">Suggested supply</h2>
            </div>
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 text-[13px] font-semibold text-green-800 hover:text-green-700"
            >
              Explore marketplace
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <Stagger className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {demoListings.slice(0, 4).map((listing) => (
              <StaggerItem key={listing.id}>
                <CropCard listing={listing} />
              </StaggerItem>
            ))}
          </Stagger>
        </Card>
      </Reveal>

      <Reveal>
        <Card className="rounded-[18px] p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-eyebrow">Farmer network</p>
              <h2 className="mt-2 font-display text-[22px] text-ink-900">Saved supplier shortlist</h2>
            </div>
            <Link
              href="/find-farmers"
              className="inline-flex items-center gap-2 text-[13px] font-semibold text-green-800 hover:text-green-700"
            >
              Find more farmers
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <Stagger className="mt-4 grid gap-4 lg:grid-cols-2">
            {demoFarmers.slice(0, 2).map((farmer) => (
              <StaggerItem key={farmer.id}>
                <FarmerMiniCard farmer={farmer} />
              </StaggerItem>
            ))}
          </Stagger>

          <div className="mt-5 rounded-[14px] border border-green-100 bg-green-50/70 px-4 py-3">
            <p className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-green-800">
              <CheckCircle2 className="h-4 w-4" /> Buyer tip
            </p>
            <p className="mt-1 text-[12.5px] text-ink-700">
              Shortlist verified farmers to unlock direct-quote flows and faster inspection scheduling.
            </p>
          </div>
        </Card>
      </Reveal>
    </section>
  );
}
