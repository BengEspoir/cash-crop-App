"use client";

import { CheckCircle2, ClipboardCheck, SearchCheck } from "lucide-react";
import {
  AdminCard,
  AdminDataTable,
  AdminPageHeader,
  AdminStatCard,
  AdminStatusPill,
  AdminToolbar,
  formatAdminDate,
} from "@/components/admin/AdminDesignSystem";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function AdminInspectionsPage() {
  const { data, isLoading } = useDashboardData("admin");
  const inspections = data?.inspections || [];
  const completed = inspections.filter((item) => ["verified", "complete", "completed", "approved"].includes(String(item.status || "").toLowerCase())).length;
  const pending = inspections.filter((item) => String(item.status || "").includes("pending")).length;

  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="Inspection Queue"
        eyebrow="Admin > Inspections"
        description="Review field quality checks, inspection status, and report availability."
        actionLabel="Export CSV"
      />

      <div className="grid gap-5 md:grid-cols-3">
        <AdminStatCard icon={SearchCheck} value={inspections.length} label="Total Inspections" tag="Quality checks" tone="blue" progress={55} />
        <AdminStatCard icon={CheckCircle2} value={completed} label="Completed" tag="Verified" tone="green" progress={60} />
        <AdminStatCard icon={ClipboardCheck} value={pending} label="Pending" tag="Awaiting field team" tone="gold" progress={30} />
      </div>

      <AdminCard title="Inspection Records">
        <div className="border-b border-ink-100 p-6">
          <AdminToolbar searchPlaceholder="Search inspection, crop, report..." filters={["Status: All", "Inspector: All"]} totalLabel={`${inspections.length} records`} />
        </div>
        <AdminDataTable
          columns={[
            { key: "subject", label: "Subject", render: (item) => item.subject || "Inspection" },
            { key: "inspector", label: "Inspector", render: (item) => item.inspector || item.inspector_name || "Inspector pending" },
            { key: "findings", label: "Findings", render: (item) => item.findings || "Findings pending" },
            { key: "report", label: "Report", render: (item) => item.report_url || "Not uploaded" },
            { key: "status", label: "Status", render: (item) => <AdminStatusPill status={item.status} /> },
            { key: "date", label: "Updated", render: (item) => formatAdminDate(item.updated_at || item.created_at) },
          ]}
          rows={inspections}
          emptyTitle={isLoading ? "Loading inspections..." : "No live inspections yet"}
          emptyDescription="Inspection records will appear once orders request quality checks."
        />
      </AdminCard>
    </section>
  );
}
