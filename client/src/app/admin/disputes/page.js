"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Scale } from "lucide-react";
import {
  AdminCard,
  AdminDataTable,
  AdminPageHeader,
  AdminStatCard,
  AdminStatusPill,
  AdminToolbar,
  formatAdminDate,
} from "@/components/admin/AdminDesignSystem";
import { Button } from "@/components/ui/button";
import { exportDashboardCsv, useDashboardData, useDashboardFilters } from "@/hooks/useDashboardData";

export default function AdminDisputesPage() {
  const [isExporting, setIsExporting] = useState(false);
  const filterState = useDashboardFilters("disputes");
  const { data, isLoading } = useDashboardData("admin", filterState.queryFilters);
  const disputes = data?.disputes || [];
  const open = disputes.filter((item) => ["open", "pending"].includes(String(item.status || "").toLowerCase())).length;
  const resolved = disputes.filter((item) => ["resolved", "verified", "closed"].includes(String(item.status || "").toLowerCase())).length;

  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="Dispute Resolution"
        eyebrow="Admin > Disputes"
        description="Track buyer and farmer conflicts, resolution progress, and operational risk."
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
        <AdminStatCard icon={Scale} value={disputes.length} label="Total Disputes" tag="All cases" tone="red" progress={35} />
        <AdminStatCard icon={AlertTriangle} value={open} label="Open Cases" tag="Needs resolution" tone="gold" progress={45} />
        <AdminStatCard icon={CheckCircle2} value={resolved} label="Resolved" tag="Closed" tone="green" progress={60} />
      </div>

      <AdminCard title="Dispute Queue">
        <div className="border-b border-ink-100 p-6">
          <AdminToolbar
            searchPlaceholder="Search dispute, order, user..."
            values={filterState.filters}
            onChange={filterState.updateFilter}
            onReset={filterState.resetFilters}
            filterOptions={[
              { key: "status", label: "Status", options: [
                { value: "all", label: "Status: All" },
                { value: "open", label: "Open" },
                { value: "pending", label: "Pending" },
                { value: "resolved", label: "Resolved" },
                { value: "closed", label: "Closed" },
              ] },
              { key: "priority", label: "Priority", options: [
                { value: "all", label: "Priority: All" },
                { value: "low", label: "Low" },
                { value: "normal", label: "Normal" },
                { value: "high", label: "High" },
                { value: "urgent", label: "Urgent" },
              ] },
            ]}
            totalLabel={`${disputes.length} records`}
          />
        </div>
        <AdminDataTable
          columns={[
            { key: "subject", label: "Subject", render: (item) => <span className="font-bold text-ink-900">{item.subject || "Dispute"}</span> },
            { key: "order", label: "Order", render: (item) => item.order_id || "Order pending" },
            { key: "description", label: "Details", render: (item) => item.description || item.resolution || "No details recorded" },
            { key: "status", label: "Status", render: (item) => <AdminStatusPill status={item.status} /> },
            { key: "date", label: "Updated", render: (item) => formatAdminDate(item.updated_at || item.created_at) },
            { key: "actions", label: "Actions", render: () => <Button variant="secondary" size="sm" disabled>Resolution workflow pending</Button> },
          ]}
          rows={disputes}
          emptyTitle={isLoading ? "Loading disputes..." : "No live disputes yet"}
          emptyDescription="Disputes will appear when users raise real order issues."
        />
      </AdminCard>
    </section>
  );
}
