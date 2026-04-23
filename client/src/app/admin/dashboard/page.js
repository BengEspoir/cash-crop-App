"use client";

import Link from "next/link";
import { ArrowUpRight, Landmark, ShieldCheck, Users } from "lucide-react";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PendingQueue } from "@/components/dashboard/PendingQueue";
import { WorkspaceHero } from "@/components/dashboard/WorkspaceHero";
import { OrderCard } from "@/components/orders/OrderCard";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Card } from "@/components/ui/card";
import {
  adminDashboardStats,
  demoAdminUsers,
  demoDisputes,
  demoNotifications,
  demoOrders,
} from "@/lib/demo-data";

const kpiIcons = [Users, Landmark, ShieldCheck];
const kpiAccents = ["green", "gold", "green"];

export default function AdminDashboardPage() {
  return (
    <section className="space-y-6">
      <WorkspaceHero
        role="admin"
        eyebrow="Admin operations"
        title="Marketplace oversight and trade protection"
        description="Review approvals, order movement, and workflow exceptions from one operational control surface."
        metrics={[
          { label: "Pending reviews", value: "9", caption: "3 new today" },
          { label: "Protected value", value: "XAF 18.7M", caption: "Current escrow" },
          { label: "Open disputes", value: "2", caption: "1 assigned" },
        ]}
        primaryAction={{ label: "Review users", href: "/admin/users" }}
        secondaryAction={{ label: "Open disputes", href: "/admin/disputes" }}
      />

      <Stagger className="grid gap-4 md:grid-cols-3">
        {adminDashboardStats.map((item, idx) => (
          <StaggerItem key={item.label}>
            <KpiCard
              {...item}
              icon={kpiIcons[idx] ?? ShieldCheck}
              accent={kpiAccents[idx] ?? "green"}
              trend="up"
            />
          </StaggerItem>
        ))}
      </Stagger>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Reveal>
          <PendingQueue title="Profiles awaiting review" items={demoAdminUsers} />
        </Reveal>
        <Reveal delay={0.08}>
          <PendingQueue title="Open disputes" items={demoDisputes} />
        </Reveal>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Reveal>
          <Card className="rounded-[18px] p-5 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="section-eyebrow">Trade movement</p>
                <h2 className="mt-2 font-display text-[22px] text-ink-900">Orders in motion</h2>
              </div>
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-2 text-[13px] font-semibold text-green-800 hover:text-green-700"
              >
                View all
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <Stagger className="mt-4 grid gap-4">
              {demoOrders.slice(0, 3).map((order) => (
                <StaggerItem key={order.id}>
                  <OrderCard order={order} href={`/admin/orders/${order.id}`} />
                </StaggerItem>
              ))}
            </Stagger>
          </Card>
        </Reveal>

        <Reveal delay={0.08}>
          <ActivityFeed items={demoNotifications} />
        </Reveal>
      </div>
    </section>
  );
}
