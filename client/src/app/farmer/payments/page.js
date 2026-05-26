"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { CreditCard, DollarSign, Download, Hourglass, WalletCards } from "lucide-react";
import {
  FarmerEmptyState,
  FarmerFilters,
  FarmerHeader,
  FarmerMetricCard,
  FarmerPage,
  FarmerPanel,
  FarmerStatusBadge,
  compactCurrency,
  formatShortDate,
} from "@/components/farmer/FarmerDesignSystem";
import { exportDashboardCsv, useDashboardData, useDashboardFilters } from "@/hooks/useDashboardData";
import { useRequestWithdrawal } from "@/hooks/usePayments";

function parseAmount(label) {
  const digits = String(label || "").replace(/[^\d.]/g, "");
  return Number(digits || 0);
}

export default function FarmerPaymentsPage() {
  const [isExporting, setIsExporting] = useState(false);
  const requestWithdrawal = useRequestWithdrawal();
  const filterState = useDashboardFilters("payments");
  const { data, isLoading } = useDashboardData("farmer", filterState.queryFilters);
  const payments = data?.payments || [];
  const orders = data?.orders || [];
  const totalEarned = payments.reduce((sum, payment) => sum + parseAmount(payment.amountLabel), 0);
  const pending = payments.filter((payment) => String(payment.status).toLowerCase().includes("pending"));
  const escrow = payments.filter((payment) => String(payment.status).toLowerCase().includes("escrow"));

  return (
    <FarmerPage>
      <FarmerHeader title="Payments & Earnings" description="All live payment and payout records connected to your farmer account." />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <FarmerMetricCard icon={DollarSign} value={compactCurrency(totalEarned)} label="Total Earned" detail="From payment records" tag="all time" tone="green" />
        <FarmerMetricCard icon={CreditCard} value={compactCurrency(payments[0]?.amountLabel || 0)} label="Latest Payment" detail="Most recent payout record" tag="Live" tone="green" />
        <FarmerMetricCard icon={Hourglass} value={compactCurrency(pending.reduce((sum, item) => sum + parseAmount(item.amountLabel), 0))} label="Pending" detail={`${pending.length} records`} tone="gold" />
        <FarmerMetricCard icon={WalletCards} value={compactCurrency(escrow.reduce((sum, item) => sum + parseAmount(item.amountLabel), 0))} label="In Escrow" detail={`${escrow.length || orders.length} open orders`} tone="cyan" />
      </div>

      <FarmerFilters
        searchPlaceholder="Search payments, buyer, channel..."
        values={filterState.filters}
        onChange={filterState.updateFilter}
        onReset={filterState.resetFilters}
        onExport={async () => {
          setIsExporting(true);
          try {
            await exportDashboardCsv("farmer", filterState.queryFilters);
          } finally {
            setIsExporting(false);
          }
        }}
        isExporting={isExporting}
        filterOptions={[
          { key: "status", label: "Status", options: [
            { value: "all", label: "Status: All" },
            { value: "pending", label: "Pending" },
            { value: "escrow", label: "Escrow" },
            { value: "released", label: "Released" },
          ] },
          { key: "sort", label: "Sort", options: [
            { value: "newest", label: "Newest" },
            { value: "oldest", label: "Oldest" },
          ] },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <FarmerPanel
          title="Transaction History"
          action={
            <div className="flex gap-3">
              <button type="button" className="inline-flex h-12 items-center gap-2 rounded-lg border border-ink-200 px-4 text-[15px] font-bold text-ink-500" disabled>
                Date filter coming soon
              </button>
              <button type="button" onClick={async () => {
                setIsExporting(true);
                try {
                  await exportDashboardCsv("farmer", filterState.queryFilters);
                } finally {
                  setIsExporting(false);
                }
              }} className="inline-flex h-12 items-center gap-2 rounded-lg border border-ink-200 px-4 text-[15px] font-bold text-ink-700 disabled:opacity-60" disabled={isExporting}>
                Export <Download className="h-4 w-4" />
              </button>
            </div>
          }
          bodyClassName="p-0"
        >
          {isLoading ? (
            <div className="p-6 text-[16px] text-ink-500">Loading live payments...</div>
          ) : payments.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-ink-50 text-[12px] font-bold uppercase tracking-[0.16em] text-ink-400">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Order</th>
                    <th className="px-6 py-4">Buyer</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-5 text-[15px] text-ink-600">{formatShortDate(payment.createdAt)}</td>
                      <td className="px-6 py-5 text-[16px] font-medium text-ink-700">{payment.id.slice(0, 8)}</td>
                      <td className="px-6 py-5 text-[16px] font-bold text-ink-950">{payment.party}</td>
                      <td className="px-6 py-5 text-[16px] font-bold text-ink-950">{payment.amountLabel}</td>
                      <td className="px-6 py-5"><FarmerStatusBadge status="pending">{payment.channel}</FarmerStatusBadge></td>
                      <td className="px-6 py-5"><FarmerStatusBadge status={payment.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6">
              <FarmerEmptyState title="No live payments yet" description="Payouts will appear after completed order payment activity." />
            </div>
          )}
        </FarmerPanel>

        <div className="space-y-6">
          <FarmerPanel title="Payout Method">
            <div className="rounded-xl border border-green-200 bg-green-50 p-5">
              <p className="text-[18px] font-bold text-ink-950">Primary payout</p>
              <p className="mt-2 text-[15px] text-ink-500">No editable payout method is exposed by the current backend contract.</p>
              <FarmerStatusBadge status="verified" className="mt-4">Connected when profile data exists</FarmerStatusBadge>
              <button
                type="button"
                disabled={requestWithdrawal.isPending}
                onClick={async () => {
                  try {
                    const result = await requestWithdrawal.mutateAsync();
                    toast.success(result?.message || "Withdrawal provider is not integrated yet.");
                  } catch (error) {
                    toast.error(error.response?.data?.message || "Withdrawal request could not be checked.");
                  }
                }}
                className="mt-5 inline-flex h-11 items-center rounded-lg bg-gold-500 px-4 text-[14px] font-bold text-white transition hover:bg-gold-600 disabled:opacity-60"
              >
                {requestWithdrawal.isPending ? "Checking..." : "Request withdrawal"}
              </button>
            </div>
          </FarmerPanel>

          <FarmerPanel title="Earnings Breakdown">
            <div className="space-y-4 text-[15px] text-ink-600">
              <div className="flex justify-between">
                <span>Payment records</span>
                <strong className="text-ink-950">{payments.length}</strong>
              </div>
              <div className="flex justify-between">
                <span>Pending records</span>
                <strong className="text-ink-950">{pending.length}</strong>
              </div>
              <div className="flex justify-between">
                <span>Open orders</span>
                <strong className="text-ink-950">{orders.length}</strong>
              </div>
            </div>
          </FarmerPanel>
        </div>
      </div>
    </FarmerPage>
  );
}
