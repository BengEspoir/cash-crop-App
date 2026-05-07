"use client";

import Link from "next/link";
import { ArrowUpRight, Landmark, ShieldCheck, Users } from "lucide-react";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { WorkspaceHero } from "@/components/dashboard/WorkspaceHero";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Card } from "@/components/ui/card";
import { useDashboardData } from "@/hooks/useDashboardData";

const kpiIcons = [Users, Landmark, ShieldCheck];
const kpiAccents = ["green", "gold", "green"];

export default function AdminDashboardPage() {
  const { data } = useDashboardData("admin");
  const metrics = data?.metrics || {};
  const pendingUsers = data?.pendingUsers || [];
  const activity = data?.activity || [];

  const adminStats = [
    { label: "Users awaiting review", value: String(metrics.pendingReviews ?? 0), delta: "Live sync" },
    { label: "Orders in motion", value: String(metrics.totalOrders ?? 0), delta: "Logistics" },
    { label: "Protected volume", value: metrics.protectedVolume || "XAF 0", delta: "Escrow" },
  ];

  return (
    <section className="space-y-6">
      <WorkspaceHero
        role="admin"
        eyebrow="Operations center"
        title="AgriculNet Admin Control"
        description="Monitor system health, review farmer applications, and manage platform logistics."
        metrics={[
          { label: "Pending reviews", value: String(metrics.pendingReviews ?? 0), caption: "Farmers" },
          { label: "Active disputes", value: String(metrics.activeDisputes ?? 0), caption: "Open" },
          { label: "Protected volume", value: metrics.protectedVolume || "XAF 0", caption: "Platform" },
        ]}
        primaryAction={{ label: "Review applications", href: "/admin/users" }}
        secondaryAction={{ label: "System settings", href: "/admin/settings" }}
      />

      <Stagger className="grid gap-4 md:grid-cols-3">
        {adminStats.map((item, idx) => (
          <StaggerItem key={item.label}>
            <KpiCard
              {...item}
              icon={kpiIcons[idx] ?? Users}
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
                <p className="section-eyebrow">User verification</p>
                <h2 className="mt-2 font-display text-[22px] text-ink-900">Farmers awaiting approval</h2>
              </div>
              <Link
                href="/admin/users"
                className="inline-flex items-center gap-2 text-[13px] font-semibold text-green-800 hover:text-green-700"
              >
                View all queue
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            {pendingUsers.length ? (
              <div className="mt-4 grid gap-3">
                {pendingUsers.slice(0, 4).map((pendingUser) => (
                  <div key={pendingUser.id} className="rounded-xl border border-ink-100 bg-ink-50 px-4 py-3">
                    <p className="font-semibold text-ink-900">{pendingUser.name}</p>
                    <p className="mt-1 text-[12px] text-ink-600">{pendingUser.region || pendingUser.country || "Region pending"}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 flex h-40 items-center justify-center rounded-xl border border-dashed border-ink-200 text-ink-500 text-sm">
                No pending verifications at the moment.
              </div>
            )}
          </Card>
        </Reveal>

        <Reveal delay={0.1}>
          <ActivityFeed items={activity} />
        </Reveal>
      </div>

      <Reveal>
        <Card className="rounded-[18px] p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-eyebrow">Platform integrity</p>
              <h2 className="mt-2 font-display text-[22px] text-ink-900">Recent critical actions</h2>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {activity.length ? activity.slice(0, 5).map((item) => (
              <div key={item.id} className="rounded-[12px] bg-[#F9FAFB] px-4 py-3">
                <p className="font-medium text-[#111827]">{item.title}</p>
                <p className="mt-2 text-[13px] leading-6 text-[#374151]">{item.detail}</p>
              </div>
            )) : (
              <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-ink-200 text-ink-500 text-sm">
                No critical actions recorded yet.
              </div>
            )}
          </div>

          <div className="mt-5 rounded-[14px] border border-blue-100 bg-blue-50/70 px-4 py-3">
            <p className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-blue-800">
              <ShieldCheck className="h-4 w-4" /> Security note
            </p>
            <p className="mt-1 text-[12.5px] text-ink-700">
              Admin sessions are logged and timed. Always ensure you are on the secure access lane before
              performing bulk approvals or payment releases.
            </p>
          </div>
        </Card>
      </Reveal>
    </section>
  );
}
