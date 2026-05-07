"use client";

import { BarChart3 } from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PageHeader } from "@/components/common/PageHeader";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function AdminAnalyticsPage() {
  const { data } = useDashboardData("admin");
  const metrics = data?.metrics || {};
  const rows = [
    { label: "Total users", value: String(metrics.totalUsers ?? 0), delta: "Live accounts" },
    { label: "Active users", value: String(metrics.activeUsers ?? 0), delta: "Approved access" },
    { label: "Listings", value: String(metrics.totalListings ?? 0), delta: "Marketplace records" },
    { label: "Orders", value: String(metrics.totalOrders ?? 0), delta: "Trade records" },
    { label: "Protected volume", value: metrics.protectedVolume || "XAF 0", delta: "Order totals" },
    { label: "Open disputes", value: String(metrics.activeDisputes ?? 0), delta: "Needs review" },
  ];

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Admin analytics"
        title="Live platform metrics"
        description="Database-backed metrics only. Empty values mean no live activity has been captured yet."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {rows.map((row) => (
          <KpiCard key={row.label} {...row} icon={BarChart3} trend="neutral" />
        ))}
      </div>
    </section>
  );
}
