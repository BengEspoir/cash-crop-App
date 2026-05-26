"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Box,
  Clock,
  Coins,
  Leaf,
  Scale,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  AdminCard,
  AdminDataTable,
  AdminPageHeader,
  AdminStatCard,
  AdminStatusPill,
  formatAdminDate,
} from "@/components/admin/AdminDesignSystem";
import { Button } from "@/components/ui/button";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function AdminDashboardPage() {
  const { data, isLoading } = useDashboardData("admin");
  const metrics = data?.metrics || {};
  const pendingUsers = data?.pendingUsers || [];
  const orders = data?.orders || [];
  const disputes = data?.disputes || [];
  const listings = data?.listings || [];

  const pendingRows = [
    ...pendingUsers.slice(0, 4).map((user) => ({
      id: user.id,
      icon: Users,
      tone: "gold",
      title: `${user.name || "User"} - Farmer Registration`,
      detail: [user.region || user.country, user.created_at ? formatAdminDate(user.created_at) : "Submitted"].filter(Boolean).join(" | "),
      action: "Review",
      href: `/admin/users/${user.id}`,
      status: user.status,
    })),
    ...listings.filter((item) => ["pending", "pending_review"].includes(item.status)).slice(0, 3).map((listing) => ({
      id: listing.id,
      icon: Leaf,
      tone: "blue",
      title: `${listing.crop} - Listing Pending`,
      detail: listing.location || "Location pending",
      action: "Approve",
      href: `/admin/listings/${listing.id}`,
      status: listing.status,
    })),
    ...disputes.slice(0, 3).map((dispute) => ({
      id: dispute.id,
      icon: Scale,
      tone: "red",
      title: dispute.subject || "Open dispute",
      detail: dispute.order_id || dispute.description || "Needs resolution",
      action: "Resolve",
      href: "/admin/disputes",
      status: dispute.status,
    })),
  ];

  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="Good morning, Admin"
        eyebrow="Thursday, 19 March 2026 | Here's what needs your attention today."
        actionLabel="Download Report"
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard icon={Users} value={metrics.totalUsers ?? 0} label="Total Users" tag="+34 this week" tone="green" progress={62} />
        <AdminStatCard icon={Clock} value={metrics.pendingReviews ?? 0} label="Pending Verifications" tag="Action required" tone="gold" progress={28} />
        <AdminStatCard icon={Leaf} value={metrics.totalListings ?? listings.length} label="Active Listings" tag="+67 this week" tone="green" progress={66} />
        <AdminStatCard icon={Box} value={metrics.totalOrders ?? orders.length} label="Open Orders" tag="awaiting action" tone="blue" progress={45} />
        <AdminStatCard icon={Coins} value={metrics.protectedVolume || "XAF 0"} label="Revenue This Month" tag="+18% vs last month" tone="gold" progress={80} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <AdminCard
          title="Pending Actions"
          action={<span className="rounded-full bg-gold-100 px-4 py-1.5 text-[14px] font-bold text-gold-800">{pendingRows.length} items</span>}
        >
          <AdminDataTable
            columns={[
              {
                key: "title",
                label: "Action",
                render: (row) => {
                  const Icon = row.icon;
                  return (
                    <div className="flex items-center gap-4">
                      <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${row.tone === "red" ? "bg-red-50 text-red-800" : row.tone === "gold" ? "bg-gold-100 text-gold-800" : "bg-blue-50 text-blue-800"}`}>
                        <Icon className="h-6 w-6" />
                      </span>
                      <div>
                        <p className="font-bold text-ink-900">{row.title}</p>
                        <p className="mt-1 text-[13px] text-ink-400">{row.detail}</p>
                      </div>
                    </div>
                  );
                },
              },
              { key: "status", label: "Status", render: (row) => <AdminStatusPill status={row.status} /> },
              {
                key: "action",
                label: "Action",
                render: (row) => (
                  <Button asChild variant={row.tone === "red" ? "danger" : row.tone === "gold" ? "outline" : "primary"} size="sm">
                    <Link href={row.href}>{row.action}</Link>
                  </Button>
                ),
              },
            ]}
            rows={pendingRows}
            emptyTitle={isLoading ? "Loading live actions..." : "No pending actions"}
            emptyDescription="Live review, listing, and dispute actions will appear here when available."
          />
        </AdminCard>

        <div className="space-y-6">
          <AdminCard title="Revenue Overview">
            <div className="p-6">
              <div className="relative h-64 rounded-2xl bg-gradient-to-b from-green-50 to-white">
                <div className="absolute inset-x-6 bottom-8 h-24 rounded-t-full border-t-[10px] border-green-800" />
                <div className="absolute bottom-12 left-1/4 h-4 w-4 rounded-full bg-green-800" />
                <div className="absolute bottom-24 right-1/4 h-4 w-4 rounded-full bg-green-800" />
              </div>
              <div className="mt-6 flex items-end justify-between">
                <div>
                  <p className="text-[32px] font-bold text-ink-900">{metrics.protectedVolume || "XAF 0"}</p>
                  <p className="text-[14px] text-ink-400">This month</p>
                </div>
                <p className="text-[15px] font-bold text-green-800">+18% vs last month</p>
              </div>
            </div>
          </AdminCard>

          <AdminCard title="Platform Integrity">
            <div className="grid gap-4 p-6">
              <div className="flex items-center gap-4 rounded-2xl bg-green-50 p-4">
                <ShieldCheck className="h-8 w-8 text-green-800" />
                <div>
                  <p className="font-bold text-ink-900">Protected sessions</p>
                  <p className="text-[13px] text-ink-500">Admin access remains role gated.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-2xl bg-red-50 p-4">
                <AlertTriangle className="h-8 w-8 text-red-800" />
                <div>
                  <p className="font-bold text-ink-900">{metrics.activeDisputes ?? 0} open disputes</p>
                  <p className="text-[13px] text-ink-500">Resolve exceptions before payment release.</p>
                </div>
              </div>
            </div>
          </AdminCard>
        </div>
      </div>
    </section>
  );
}
