"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { CreditCard, Landmark, RefreshCw, Wallet } from "lucide-react";
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
import { useReleasePayment } from "@/hooks/usePayments";

export default function AdminPaymentsPage() {
  const [isExporting, setIsExporting] = useState(false);
  const releasePayment = useReleasePayment();
  const filterState = useDashboardFilters("payments");
  const { data, isLoading } = useDashboardData("admin", filterState.queryFilters);
  const payments = data?.payments || [];
  const pending = payments.filter((payment) => String(payment.status || "").includes("pending")).length;

  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="Payments & Commissions"
        eyebrow="Admin > Payments"
        description="Track protected payment records, escrow state, and payout readiness from live records."
        actionLabel={null}
      />

      <div className="grid gap-5 md:grid-cols-4">
        <AdminStatCard icon={Wallet} value={data?.metrics?.protectedVolume || "XAF 0"} label="Total Revenue" tag="+18% green" tone="blue" progress={78} />
        <AdminStatCard icon={CreditCard} value={pending} label="Pending Payouts" tag={`${pending} pending`} tone="gold" progress={35} />
        <AdminStatCard icon={RefreshCw} value={payments.length} label="In Escrow" tag={`${payments.length} records`} tone="green" progress={58} />
        <AdminStatCard icon={Landmark} value="XAF 0" label="Commission Earned" tag="+22% green" tone="gold" progress={48} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <AdminCard title="Transaction History" action={<Button variant="secondary" size="sm" isLoading={isExporting} onClick={async () => {
          setIsExporting(true);
          try {
            await exportDashboardCsv("admin", filterState.queryFilters);
          } finally {
            setIsExporting(false);
          }
        }}>Export</Button>}>
          <div className="border-b border-ink-100 p-6">
            <AdminToolbar
              searchPlaceholder="Search transaction, party, or method..."
              values={filterState.filters}
              onChange={filterState.updateFilter}
              onReset={filterState.resetFilters}
              filterOptions={[
                { key: "status", label: "Status", options: [
                  { value: "all", label: "Status: All" },
                  { value: "pending", label: "Pending" },
                  { value: "escrow", label: "Escrow" },
                  { value: "released", label: "Released" },
                  { value: "failed", label: "Failed" },
                ] },
                { key: "sort", label: "Sort", options: [
                  { value: "newest", label: "Newest" },
                  { value: "oldest", label: "Oldest" },
                ] },
              ]}
              totalLabel={`${payments.length} records`}
            />
          </div>
          <AdminDataTable
            columns={[
              { key: "id", label: "Txn ID", render: (payment) => payment.id },
              { key: "party", label: "Party", render: (payment) => payment.party },
              { key: "amountLabel", label: "Amount", render: (payment) => <span className="font-bold text-ink-900">{payment.amountLabel}</span> },
              { key: "channel", label: "Method", render: (payment) => <AdminStatusPill status={payment.channel} label={payment.channel} /> },
              { key: "status", label: "Status", render: (payment) => <AdminStatusPill status={payment.status} /> },
              { key: "createdAt", label: "Date", render: (payment) => formatAdminDate(payment.createdAt) },
            ]}
            rows={payments}
            emptyTitle={isLoading ? "Loading live payments..." : "No live payments yet"}
            emptyDescription="Payment records will appear once orders begin moving through checkout."
          />
        </AdminCard>

        <AdminCard title="Pending Payouts" action={<Button variant="secondary" size="sm" disabled={!pending || releasePayment.isPending}>Release ready payouts</Button>}>
          <div className="divide-y divide-ink-100">
            {payments.filter((payment) => String(payment.status || "").includes("pending")).length ? (
              payments.filter((payment) => String(payment.status || "").includes("pending")).slice(0, 6).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between gap-4 px-6 py-5">
                  <div>
                    <p className="font-bold text-ink-900">{payment.party}</p>
                    <p className="mt-1 text-[13px] text-gold-800">{payment.amountLabel}</p>
                  </div>
                  <Button
                    variant="accent-gold"
                    size="sm"
                    isLoading={releasePayment.isPending}
                    onClick={async () => {
                      try {
                        await releasePayment.mutateAsync(payment.id);
                        toast.success("Payment released.");
                      } catch (error) {
                        toast.error(error.response?.data?.message || "Payment could not be released.");
                      }
                    }}
                  >
                    Release
                  </Button>
                </div>
              ))
            ) : (
              <div className="p-6 text-[14px] text-ink-500">No pending payouts in live payment records.</div>
            )}
          </div>
        </AdminCard>
      </div>
    </section>
  );
}
