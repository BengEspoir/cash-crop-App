"use client";

import Link from "next/link";
import { ArrowUpRight, BadgeCheck, CheckCircle2, CircleDollarSign, Leaf, Package, TrendingUp } from "lucide-react";
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

const kpiIcons = [Package, CircleDollarSign, BadgeCheck];
const kpiAccents = ["green", "gold", "green"];

export default function FarmerDashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useDashboardData("farmer");
  const { quotes } = useQuotes();
  const listings = data?.listings || [];
  const orders = data?.orders || [];
  const metrics = data?.metrics || {};

  const farmerStats = [
    { label: "Active listings", value: String(metrics.activeListings ?? listings.length), delta: "Live data" },
    { label: "Protected revenue", value: metrics.protectedRevenue || "XAF 0", delta: "Across open orders" },
    { label: "Unread messages", value: String(metrics.unreadMessages ?? 0), delta: "Buyer follow-ups" },
  ];

  return (
    <section className="space-y-6">
      <WorkspaceHero
        role="farmer"
        eyebrow="Farmer workspace"
        title={`Welcome back, ${user?.first_name}`}
        description="Manage your inventory, track orders, and monitor your payouts in real-time."
        metrics={[
          { label: "Active listings", value: listings.length.toString(), caption: "Live" },
          { label: "Open orders", value: orders.length.toString(), caption: "Requiring action" },
          { label: "Revenue", value: metrics.protectedRevenue || "XAF 0", caption: "Live total" },
        ]}
        primaryAction={{ label: "Create listing", href: "/farmer/listings/new" }}
        secondaryAction={{ label: "Manage inventory", href: "/farmer/listings" }}
      />

      <VerificationBanner />

      <DashboardOperationsRow
        quotes={quotes}
        orders={orders}
        variant="seller"
        listingsCount={listings.length}
        exportReadyListingCount={listings.filter((l) => l.exportReady || l.export_ready).length}
      />

      <Stagger className="grid gap-4 md:grid-cols-3">
        {farmerStats.map((item, idx) => (
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

            <div className="mt-4 min-h-[200px]">
              {isLoading ? (
                <div className="flex h-40 items-center justify-center text-ink-500">Loading listings...</div>
              ) : listings.length > 0 ? (
                <Stagger className="grid gap-4 lg:grid-cols-2">
                  {listings.slice(0, 4).map((listing) => (
                    <StaggerItem key={listing.id}>
                      <CropCard listing={listing} href={`/farmer/listings/${listing.id}`} />
                    </StaggerItem>
                  ))}
                </Stagger>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 text-center">
                  <Package className="mb-2 h-8 w-8 text-ink-300" />
                  <p className="text-[14px] text-ink-500">No active listings yet.</p>
                  <Link href="/farmer/listings/new" className="mt-2 text-[13px] font-bold text-green-700">Create your first listing</Link>
                </div>
              )}
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.1}>
          <ActivityFeed items={[]} />
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
              <TrendingUp className="h-3.5 w-3.5" /> Live synchronization
            </span>
          </div>
          
          <div className="mt-4 min-h-[150px]">
            {isLoading ? (
              <div className="flex h-32 items-center justify-center text-ink-500">Loading orders...</div>
            ) : orders.length > 0 ? (
              <Stagger className="grid gap-4">
                {orders.slice(0, 3).map((order) => (
                  <StaggerItem key={order.id}>
                    <OrderCard order={order} href={`/farmer/orders/${order.id}`} />
                  </StaggerItem>
                ))}
              </Stagger>
            ) : (
              <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 text-center">
                <CheckCircle2 className="mb-2 h-8 w-8 text-ink-300" />
                <p className="text-[14px] text-ink-500">No active orders found.</p>
              </div>
            )}
          </div>

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
