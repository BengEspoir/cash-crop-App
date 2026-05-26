"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Mail, Phone, ShieldCheck, UserCheck, Users } from "lucide-react";
import {
  AdminCard,
  AdminDataTable,
  AdminPageHeader,
  AdminStatCard,
  AdminStatusPill,
  AdminToolbar,
  formatAdminDate,
  formatRole,
} from "@/components/admin/AdminDesignSystem";
import { Button } from "@/components/ui/button";
import { exportDashboardCsv, useDashboardData, useDashboardFilters } from "@/hooks/useDashboardData";
import { AdminUserReviewDrawer } from "@/components/admin/AdminUserReviewDrawer";

export default function AdminUsersPage() {
  const [drawerUser, setDrawerUser] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const filterState = useDashboardFilters("users");
  const { data, isLoading } = useDashboardData("admin", filterState.queryFilters);
  const users = useMemo(() => data?.users || [], [data?.users]);
  const pending = users.filter((user) => String(user.status || "").includes("pending")).length;
  const active = users.filter((user) => user.status === "active").length;
  const farmers = users.filter((user) => user.role === "farmer").length;

  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="Users Management"
        eyebrow="Admin > Users"
        description="Review all live user records, approval state, and contact readiness from the admin workspace."
        actionLabel="Export CSV"
        actionLoading={isExporting}
        onAction={async () => {
          setIsExporting(true);
          try {
            await exportDashboardCsv("admin", filterState.queryFilters);
          } finally {
            setIsExporting(false);
          }
        }}
      />

      <div className="grid gap-5 md:grid-cols-3">
        <AdminStatCard icon={Users} value={users.length} label="Total Users" tag="Live accounts" tone="green" progress={70} />
        <AdminStatCard icon={UserCheck} value={active} label="Active Users" tag={`${farmers} farmers`} tone="blue" progress={55} />
        <AdminStatCard icon={ShieldCheck} value={pending} label="Pending Review" tag="Action required" tone="gold" progress={35} />
      </div>

      <AdminCard title="User Directory">
        <div className="border-b border-ink-100 p-6">
          <AdminToolbar
            searchPlaceholder="Search name, email, phone, or role..."
            values={filterState.filters}
            onChange={filterState.updateFilter}
            onReset={filterState.resetFilters}
            filterOptions={[
              { key: "role", label: "Role", options: [
                { value: "all", label: "Role: All" },
                { value: "farmer", label: "Farmer" },
                { value: "buyer", label: "Buyer" },
                { value: "reseller", label: "Reseller" },
                { value: "admin", label: "Admin" },
              ] },
              { key: "status", label: "Status", options: [
                { value: "all", label: "Status: All" },
                { value: "active", label: "Active" },
                { value: "pending", label: "Pending" },
                { value: "suspended", label: "Suspended" },
              ] },
              { key: "sort", label: "Sort", options: [
                { value: "newest", label: "Newest" },
                { value: "oldest", label: "Oldest" },
              ] },
            ]}
            totalLabel={`${users.length} live profiles`}
          />
        </div>
        <AdminDataTable
          columns={[
            {
              key: "name",
              label: "User",
              render: (user) => (
                <div>
                  <p className="font-bold text-ink-900">{user.name || "Unnamed user"}</p>
                  <p className="mt-1 text-[13px] capitalize text-ink-400">{formatRole(user.role)}</p>
                </div>
              ),
            },
            {
              key: "contact",
              label: "Contact",
              render: (user) => (
                <div className="space-y-1">
                  <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-ink-400" />{user.email || "Email pending"}</p>
                  <p className="flex items-center gap-2 text-ink-400"><Phone className="h-4 w-4" />{user.phone || "Phone pending"}</p>
                </div>
              ),
            },
            { key: "region", label: "Region", render: (user) => user.region || user.country || "Region pending" },
            { key: "status", label: "Status", render: (user) => <AdminStatusPill status={user.status} /> },
            { key: "created_at", label: "Joined", render: (user) => formatAdminDate(user.created_at) },
            {
              key: "actions",
              label: "Actions",
              render: (user) => (
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setDrawerUser(user)}>Quick review</Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/users/${user.id}`}>Open</Link>
                  </Button>
                </div>
              ),
            },
          ]}
          rows={users}
          emptyTitle={isLoading ? "Loading live users..." : "No live users yet"}
          emptyDescription="Registered users will appear here once the backend returns account records."
        />
      </AdminCard>

      <AdminUserReviewDrawer user={drawerUser} open={Boolean(drawerUser)} onClose={() => setDrawerUser(null)} />
    </section>
  );
}
