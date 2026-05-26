"use client";

import { useState } from "react";
import { MapPin, Route, Truck } from "lucide-react";
import {
  AdminCard,
  AdminDataTable,
  AdminPageHeader,
  AdminStatCard,
  AdminStatusPill,
  AdminToolbar,
  formatAdminDate,
} from "@/components/admin/AdminDesignSystem";
import { exportDashboardCsv, useDashboardData, useDashboardFilters } from "@/hooks/useDashboardData";

export default function AdminLogisticsPage() {
  const [isExporting, setIsExporting] = useState(false);
  const filterState = useDashboardFilters("logistics");
  const { data, isLoading } = useDashboardData("admin", filterState.queryFilters);
  const logistics = data?.logistics || [];
  const active = logistics.filter((item) => ["active", "in_transit", "in-transit"].includes(String(item.status || "").toLowerCase())).length;

  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="Logistics Control"
        eyebrow="Admin > Logistics"
        description="Monitor live shipment lanes, carrier records, and fulfillment movement."
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
        <AdminStatCard icon={Truck} value={logistics.length} label="Shipments" tag="Live lanes" tone="blue" progress={55} />
        <AdminStatCard icon={Route} value={active} label="In Transit" tag="Moving" tone="green" progress={45} />
        <AdminStatCard icon={MapPin} value="0" label="Exceptions" tag="Needs review" tone="red" progress={12} />
      </div>

      <AdminCard title="Shipment Records">
        <div className="border-b border-ink-100 p-6">
          <AdminToolbar
            searchPlaceholder="Search lane, carrier, tracking number..."
            values={filterState.filters}
            onChange={filterState.updateFilter}
            onReset={filterState.resetFilters}
            filterOptions={[
              { key: "status", label: "Status", options: [
                { value: "all", label: "Status: All" },
                { value: "active", label: "Active" },
                { value: "transit", label: "In transit" },
                { value: "delivered", label: "Delivered" },
                { value: "delayed", label: "Delayed" },
              ] },
              { key: "sort", label: "Sort", options: [
                { value: "newest", label: "Newest" },
                { value: "oldest", label: "Oldest" },
              ] },
            ]}
            totalLabel={`${logistics.length} records`}
          />
        </div>
        <AdminDataTable
          columns={[
            { key: "lane", label: "Lane", render: (item) => item.lane || item.route || "Lane pending" },
            { key: "carrier", label: "Carrier", render: (item) => item.carrier_name || "Carrier pending" },
            { key: "tracking", label: "Tracking", render: (item) => item.tracking_number || item.id },
            { key: "location", label: "Location", render: (item) => item.current_location || "Location pending" },
            { key: "status", label: "Status", render: (item) => <AdminStatusPill status={item.status} /> },
            { key: "date", label: "Updated", render: (item) => formatAdminDate(item.updated_at || item.created_at) },
          ]}
          rows={logistics}
          emptyTitle={isLoading ? "Loading logistics..." : "No live logistics records yet"}
          emptyDescription="Shipment and carrier records will appear once orders move into fulfillment."
        />
      </AdminCard>
    </section>
  );
}
