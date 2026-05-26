"use client";

import { CreditCard, ShieldCheck } from "lucide-react";
import {
  BuyerEmptyState,
  BuyerHeader,
  BuyerMetricCard,
  BuyerPage,
  BuyerPanel,
  BuyerStatusBadge,
  compactBuyerCurrency,
  formatBuyerDate,
} from "@/components/buyer/BuyerDesignSystem";
import { useDashboardData } from "@/hooks/useDashboardData";
import { usePayments } from "@/hooks/usePayments";

function parseAmount(label) {
  const digits = String(label || "").replace(/[^\d.]/g, "");
  return Number(digits || 0);
}

export default function BuyerPaymentsPage() {
  const { data: dashboard } = useDashboardData("buyer");
  const { data: payments = [], isLoading } = usePayments();
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

      <BuyerPanel title="Payment Activity" bodyClassName="p-0">
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
