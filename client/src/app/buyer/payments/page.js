"use client";

import { useState } from "react";
import { CreditCard, ShieldCheck } from "lucide-react";
import {
  BuyerEmptyState,
  BuyerButton,
  BuyerHeader,
  BuyerMetricCard,
  BuyerPage,
  BuyerPanel,
  BuyerStatusBadge,
  compactBuyerCurrency,
  formatBuyerDate,
} from "@/components/buyer/BuyerDesignSystem";
import { exportDashboardCsv, useDashboardData, useDashboardFilters } from "@/hooks/useDashboardData";

function parseAmount(label) {
  const digits = String(label || "").replace(/[^\d.]/g, "");
  return Number(digits || 0);
}

export default function BuyerPaymentsPage() {
  const [isExporting, setIsExporting] = useState(false);
  const filterState = useDashboardFilters("payments");
  const { data: dashboard, isLoading } = useDashboardData("buyer", filterState.queryFilters);
  const payments = dashboard?.payments || [];
  const buyerOrders = dashboard?.orders || [];
  const sourcedTotal = buyerOrders.reduce((sum, order) => sum + Number(order.amount || 0), 0);
  const paymentTotal = payments.reduce((sum, payment) => sum + parseAmount(payment.amountLabel), 0);

  return (
    <BuyerPage>
      <BuyerHeader title="Payments" description="Review protected payment activity and sourced order value connected to your buyer account." />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <BuyerMetricCard icon={ShieldCheck} value={compactBuyerCurrency(sourcedTotal)} label="Protected Order Value" detail={`${buyerOrders.length} buyer order records`} tag="Escrow aware" tone="green" />
        <BuyerMetricCard icon={CreditCard} value={compactBuyerCurrency(paymentTotal)} label="Payment Records" detail={`${payments.length} ledger records visible`} tag="Live" tone="gold" />
        <BuyerMetricCard icon={ShieldCheck} value={String(buyerOrders.length)} label="Orders Tracked" detail="Buyer dashboard contract" tone="blue" />
      </div>

      <BuyerPanel
        title="Payment Activity"
        action={<BuyerButton variant="gold" disabled={isExporting} onClick={async () => {
          setIsExporting(true);
          try {
            await exportDashboardCsv("buyer", filterState.queryFilters);
          } finally {
            setIsExporting(false);
          }
        }}>{isExporting ? "Exporting..." : "Export CSV"}</BuyerButton>}
        bodyClassName="p-0"
      >
        <div className="border-b border-ink-100 p-5">
          <div className="flex flex-col gap-3 lg:flex-row">
            <input
              type="search"
              placeholder="Search payments, farmer, channel..."
              value={filterState.filters.q || ""}
              onChange={(event) => filterState.updateFilter("q", event.target.value)}
              className="h-12 flex-1 rounded-lg border border-ink-200 px-4 text-[15px] outline-none focus:border-green-700"
            />
            <select value={filterState.filters.status} onChange={(event) => filterState.updateFilter("status", event.target.value)} className="h-12 rounded-lg border border-ink-200 px-3 text-[14px] font-medium text-ink-700 outline-none focus:border-green-700">
              <option value="all">Status: All</option>
              <option value="pending">Pending</option>
              <option value="escrow">Escrow</option>
              <option value="released">Released</option>
              <option value="failed">Failed</option>
            </select>
            <button type="button" onClick={filterState.resetFilters} className="h-12 rounded-lg border border-ink-200 px-4 text-[14px] font-bold text-green-800">Reset</button>
          </div>
        </div>
        {isLoading ? (
          <div className="p-6 text-[16px] text-ink-500">Loading payment records...</div>
        ) : payments.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-ink-50 text-[12px] font-bold uppercase tracking-[0.16em] text-ink-400">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Reference</th>
                  <th className="px-6 py-4">Channel</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {payments.map((payment) => (
                  <tr key={payment.id} className="transition-colors hover:bg-green-50/40">
                    <td className="px-6 py-5 text-[15px] text-ink-600">{formatBuyerDate(payment.createdAt)}</td>
                    <td className="px-6 py-5 text-[16px] font-medium text-ink-700">{payment.id.slice(0, 8)}</td>
                    <td className="px-6 py-5 text-[16px] font-bold text-ink-950">{payment.channel}</td>
                    <td className="px-6 py-5 text-[16px] font-bold text-ink-950">{payment.amountLabel}</td>
                    <td className="px-6 py-5"><BuyerStatusBadge status={payment.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <BuyerEmptyState title="No buyer payment records yet" description="Payment ledger entries will appear after protected order payment activity is recorded." />
          </div>
        )}
      </BuyerPanel>
    </BuyerPage>
  );
}
