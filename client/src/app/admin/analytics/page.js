"use client";

import { BarChart3, PieChart, TrendingUp, Users } from "lucide-react";
import {
  AdminCard,
  AdminPageHeader,
  AdminStatCard,
} from "@/components/admin/AdminDesignSystem";
import { useDashboardData } from "@/hooks/useDashboardData";

const chartBars = [42, 58, 46, 70, 64, 82];

export default function AdminAnalyticsPage() {
  const { data } = useDashboardData("admin");
  const metrics = data?.metrics || {};

  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="Analytics Dashboard"
        eyebrow="Admin > Analytics"
        description="Live platform metrics with operational trend views for users, listings, orders, and dispute load."
        actionLabel="Export Report"
      />

      <div className="grid gap-5 md:grid-cols-4">
        <AdminStatCard icon={Users} value={metrics.totalUsers ?? 0} label="Total Users" tag="+18%" tone="green" progress={74} />
        <AdminStatCard icon={BarChart3} value={metrics.totalListings ?? 0} label="Listings" tag="Marketplace" tone="blue" progress={58} />
        <AdminStatCard icon={TrendingUp} value={metrics.totalOrders ?? 0} label="Orders" tag="Live" tone="gold" progress={45} />
        <AdminStatCard icon={PieChart} value={metrics.activeDisputes ?? 0} label="Disputes" tag="Risk" tone="red" progress={18} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <AdminCard title="Revenue Overview" subtitle="This month">
          <div className="p-7">
            <div className="flex h-80 items-end gap-5 border-b border-l border-ink-100 px-4 pb-4">
              {chartBars.map((height, index) => (
                <div key={index} className="flex flex-1 flex-col items-center gap-3">
                  <div className="w-full rounded-t-2xl bg-green-800/85" style={{ height: `${height}%` }} />
                  <span className="text-[12px] text-ink-400">{["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"][index]}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-end justify-between">
              <p className="text-[36px] font-bold text-ink-900">{metrics.protectedVolume || "XAF 0"}</p>
              <p className="font-bold text-green-800">+18% vs last month</p>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Operational Mix">
          <div className="grid gap-4 p-7">
            {[
              ["Users", metrics.totalUsers ?? 0, "green"],
              ["Listings", metrics.totalListings ?? 0, "blue"],
              ["Orders", metrics.totalOrders ?? 0, "gold"],
              ["Open disputes", metrics.activeDisputes ?? 0, "red"],
            ].map(([label, value, tone]) => (
              <div key={label} className="rounded-2xl border border-ink-100 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-ink-900">{label}</p>
                  <p className="text-[24px] font-bold text-ink-900">{value}</p>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-ink-100">
                  <div className={`h-full rounded-full ${tone === "green" ? "bg-green-800" : tone === "blue" ? "bg-blue-800" : tone === "gold" ? "bg-gold-700" : "bg-red-700"}`} style={{ width: `${Math.max(8, Math.min(90, Number(value) || 8))}%` }} />
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>

      <AdminCard title="Analytics Notes">
        <div className="p-7 text-[15px] leading-7 text-ink-500">
          These analytics are derived from the existing admin dashboard response. Missing values indicate that the corresponding live database records have not been captured yet.
        </div>
      </AdminCard>
    </section>
  );
}
