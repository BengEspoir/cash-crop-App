"use client";

import { useState } from "react";
import { LockKeyhole, ScrollText, ShieldAlert, ShieldCheck } from "lucide-react";
import {
  AdminCard,
  AdminDataTable,
  AdminPageHeader,
  AdminStatCard,
  AdminStatusPill,
  AdminToolbar,
  formatAdminDate,
  formatAdminTime,
} from "@/components/admin/AdminDesignSystem";
import { exportDashboardCsv, useDashboardData, useDashboardFilters } from "@/hooks/useDashboardData";

function actionCode(title = "") {
  const value = String(title).toLowerCase();
  if (value.includes("login") || value.includes("auth")) return "AUTH";
  if (value.includes("payment") || value.includes("payout")) return "FIN";
  if (value.includes("config") || value.includes("setting")) return "SYS";
  if (value.includes("reject") || value.includes("approve") || value.includes("review")) return "MOD";
  return "LOG";
}

export default function AdminAuditLogsPage() {
  const [isExporting, setIsExporting] = useState(false);
  const filterState = useDashboardFilters("activity", { limit: 100 });
  const { data, isLoading } = useDashboardData("admin", filterState.queryFilters);
  const activity = data?.activity || [];
  const failures = activity.filter((item) => String(item.status || item.title || "").toLowerCase().includes("fail")).length;

  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="System Audit Logs"
        eyebrow="Admin > System > Audit Logs"
        description="Tracking all administrative and system-level actions for security and compliance."
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
        <AdminStatCard icon={ScrollText} value={activity.length} label="Total Entries" tag="Live activity" tone="blue" progress={65} />
        <AdminStatCard icon={ShieldCheck} value={activity.length - failures} label="Successful" tag="Recorded" tone="green" progress={70} />
        <AdminStatCard icon={ShieldAlert} value={failures} label="Failed" tag="Needs review" tone="red" progress={20} />
      </div>

      <AdminCard title="Audit Trail">
        <div className="border-b border-ink-100 p-6">
          <AdminToolbar
            searchPlaceholder="Search action or resource..."
            values={filterState.filters}
            onChange={filterState.updateFilter}
            onReset={filterState.resetFilters}
            filterOptions={[
              { key: "status", label: "Status", options: [
                { value: "all", label: "Status: All" },
                { value: "success", label: "Success" },
                { value: "failed", label: "Failed" },
                { value: "warning", label: "Warning" },
              ] },
              { key: "sort", label: "Sort", options: [
                { value: "newest", label: "Newest" },
                { value: "oldest", label: "Oldest" },
              ] },
            ]}
            totalLabel={`${activity.length} total entries`}
          />
        </div>
        <AdminDataTable
          columns={[
            {
              key: "timestamp",
              label: "Timestamp",
              render: (item) => (
                <div>
                  <p className="font-medium text-ink-800">{formatAdminTime(item.createdAt)}</p>
                  <p className="mt-1 text-[13px] text-ink-400">{formatAdminDate(item.createdAt)}</p>
                </div>
              ),
            },
            {
              key: "actor",
              label: "Admin / User",
              render: (item) => (
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#5547BF] text-[14px] font-bold text-white">
                    {(item.actor?.name || "System").slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <p className="font-bold text-ink-900">{item.actor?.name || "System"}</p>
                    <p className="text-[13px] text-ink-400">{item.actorRole || item.actor?.role || "system"}</p>
                  </div>
                </div>
              ),
            },
            {
              key: "action",
              label: "Action",
              render: (item) => (
                <div className="flex items-center gap-3">
                  <AdminStatusPill status={actionCode(item.title)} label={actionCode(item.title)} />
                  <span className="font-medium text-ink-900">{item.title}</span>
                </div>
              ),
            },
            { key: "resource", label: "Resource", render: (item) => <span className="rounded-lg bg-ink-100 px-3 py-1 text-[13px]">{item.resourceType || item.resourceId || "activity"}</span> },
            { key: "details", label: "IP Address / Details", render: (item) => item.ipAddress || item.detail || "System activity recorded." },
            { key: "status", label: "Status", render: (item) => <AdminStatusPill status={item.status || "success"} label={String(item.status || "success")} /> },
          ]}
          rows={activity}
          emptyTitle={isLoading ? "Loading audit activity..." : "No audit activity yet"}
          emptyDescription="Live audit records from the audit log table will appear here."
        />
      </AdminCard>

      <AdminCard title="Security Boundary">
        <div className="flex items-center gap-4 p-6 text-[14px] text-ink-600">
          <LockKeyhole className="h-6 w-6 text-green-800" />
          This screen reads audit-log records only. It does not expose private verification files or write audit records.
        </div>
      </AdminCard>
    </section>
  );
}
