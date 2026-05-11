"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle2, ClipboardList, Package, ShoppingBasket } from "lucide-react";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { WorkspaceHero } from "@/components/dashboard/WorkspaceHero";
import { CropCard } from "@/components/crops/CropCard";
import { OrderCard } from "@/components/orders/OrderCard";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Card } from "@/components/ui/card";
import { VerificationBanner } from "@/components/common/VerificationBanner";
import useAuth from "@/hooks/useAuth";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useQuotes } from "@/hooks/useQuotes";
import { DashboardOperationsRow } from "@/components/dashboard/DashboardOperationsRow";

const kpiIcons = [Package, ShoppingBasket, ClipboardList];
const kpiAccents = ["green", "gold", "green"];

export default function BuyerDashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useDashboardData("buyer");
  const { quotes } = useQuotes();
  const orders = data?.orders || [];
  const listings = data?.listings || [];
  const metrics = data?.metrics || {};

  const buyerStats = [
    { label: "Protected orders", value: String(metrics.activeOrders ?? orders.length), delta: "Live data" },
    { label: "Saved listings", value: String(metrics.savedListings ?? 0), delta: "Items you like" },
    { label: "Open quotes", value: String(metrics.openQuotes ?? 0), delta: "Awaiting reply" },
  ];

  return (
    <section className="space-y-6">
      <WorkspaceHero
        role="buyer"
        eyebrow="Buyer workspace"
        title={`Welcome back, ${user?.first_name}`}
        description="Track your sourcing, manage orders, and explore new partners in real-time."
        metrics={[
          { label: "Active orders", value: orders.length.toString(), caption: "In progress" },
          { label: "Saved listings", value: String(metrics.savedListings ?? 0), caption: "Shortlisted" },
          { label: "Open RFQs", value: String(metrics.openQuotes ?? 0), caption: "Quotes" },
        ]}
        primaryAction={{ label: "Browse supply", href: "/browse" }}
        secondaryAction={{ label: "Request a quote", href: "/request-quote" }}
      />

      <VerificationBanner />

      <DashboardOperationsRow
        quotes={quotes}
        orders={orders}
        variant="buyer"
        buyerSavedShortlist={metrics.savedListings ?? 0}
        listingsCount={listings.length}
        exportReadyListingCount={listings.filter((l) => l.exportReady || l.export_ready).length}
      />

      <Stagger className="grid gap-4 md:grid-cols-3">
        {buyerStats.map((item, idx) => (
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
            
            <div className="mt-4 min-h-[150px]">
              {isLoading ? (
                <div className="flex h-32 items-center justify-center text-ink-500">Loading orders...</div>
              ) : orders.length > 0 ? (
                <Stagger className="grid gap-4">
                  {orders.slice(0, 2).map((order) => (
                    <StaggerItem key={order.id}>
                      <OrderCard order={order} href={`/buyer/orders/${order.id}`} />
                    </StaggerItem>
                  ))}
                </Stagger>
              ) : (
                <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 text-center">
                  <Package className="mb-2 h-8 w-8 text-ink-300" />
                  <p className="text-[14px] text-ink-500">No active orders found.</p>
                </div>
              )}
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.08}>
          <ActivityFeed items={[]} />
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
          
          <div className="mt-4 min-h-[200px]">
            {isLoading ? (
              <div className="flex h-40 items-center justify-center text-ink-500">Loading supply...</div>
            ) : listings.length > 0 ? (
              <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {listings.slice(0, 4).map((listing) => (
                  <StaggerItem key={listing.id}>
                    <CropCard listing={listing} />
                  </StaggerItem>
                ))}
              </Stagger>
            ) : (
              <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 text-center">
                <ShoppingBasket className="mb-2 h-8 w-8 text-ink-300" />
                <p className="text-[14px] text-ink-500">No suggestions available right now.</p>
              </div>
            )}
          </div>
        </Card>
      </Reveal>

      <div className="mt-5 rounded-[14px] border border-green-100 bg-green-50/70 px-4 py-3">
        <p className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-green-800">
          <CheckCircle2 className="h-4 w-4" /> Buyer tip
        </p>
        <p className="mt-1 text-[12.5px] text-ink-700">
          Shortlist verified farmers to unlock direct-quote flows and faster inspection scheduling.
        </p>
      </div>
    </section>
  );
}
