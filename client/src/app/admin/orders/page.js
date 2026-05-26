"use client";

import { useState } from "react";
import Link from "next/link";
import { Box, Clock, Package, Truck } from "lucide-react";
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

export default function AdminOrdersPage() {
  const [isExporting, setIsExporting] = useState(false);
  const filterState = useDashboardFilters("orders");
  const { data, isLoading } = useDashboardData("admin", filterState.queryFilters);
  const orders = data?.orders || [];
  const activeOrders = orders.filter((order) => !["delivered", "cancelled", "completed"].includes(String(order.status || "").toLowerCase())).length;
  const totalAmount = orders.reduce((sum, order) => sum + Number(order.amount || 0), 0);

  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="All Orders"
        eyebrow={`Admin > Orders`}
        description={`${orders.length} total orders | ${activeOrders} active`}
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

      <div className="grid gap-5 md:grid-cols-4">
        <AdminStatCard icon={Package} value={orders.length} label="Total Orders" tone="gray" progress={65} />
        <AdminStatCard icon={Box} value={activeOrders} label="Active Orders" tone="blue" progress={45} />
        <AdminStatCard icon={Truck} value={`XAF ${totalAmount.toLocaleString("en-CM", { maximumFractionDigits: 0 })}`} label="Order Value" tone="gold" progress={78} />
        <AdminStatCard icon={Clock} value="4.2 days" label="Avg Delivery Time" tone="green" progress={50} />
      </div>

      <AdminCard title="Order Records">
        <div className="border-b border-ink-100 p-6">
          <AdminToolbar
            searchPlaceholder="Search by order ID, buyer, farmer..."
            values={filterState.filters}
            onChange={filterState.updateFilter}
            onReset={filterState.resetFilters}
            filterOptions={[
              { key: "status", label: "Status", options: [
                { value: "all", label: "Status: All" },
                { value: "pending", label: "Pending" },
                { value: "confirmed", label: "Confirmed" },
                { value: "transit", label: "In transit" },
                { value: "delivered", label: "Delivered" },
                { value: "cancelled", label: "Cancelled" },
              ] },
              { key: "sort", label: "Sort", options: [
                { value: "newest", label: "Newest" },
                { value: "oldest", label: "Oldest" },
              ] },
            ]}
            totalLabel={`${orders.length} records`}
          />
        </div>
        <AdminDataTable
          columns={[
            { key: "id", label: "Order ID", render: (order) => order.id },
            { key: "buyerName", label: "Buyer", render: (order) => order.buyerName },
            { key: "farmerName", label: "Farmer", render: (order) => order.farmerName },
            { key: "crop", label: "Crop", render: (order) => order.crop },
            { key: "amountLabel", label: "Amount", render: (order) => <span className="font-bold text-ink-900">{order.amountLabel}</span> },
            { key: "status", label: "Status", render: (order) => <AdminStatusPill status={order.status} /> },
            { key: "createdAt", label: "Date", render: (order) => formatAdminDate(order.createdAt) },
            {
              key: "actions",
              label: "Actions",
              render: (order) => (
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/admin/orders/${order.rawId || order.id}`}>View</Link>
                </Button>
              ),
            },
          ]}
          rows={orders}
          rowKey="rawId"
          emptyTitle={isLoading ? "Loading live orders..." : "No live orders yet"}
          emptyDescription="Orders will appear here once buyers create real transactions."
        />
      </AdminCard>
    </section>
  );
}
