"use client";

import { CreditCard, DollarSign, Download, Hourglass, WalletCards } from "lucide-react";
import {
  FarmerEmptyState,
  FarmerHeader,
  FarmerMetricCard,
  FarmerPage,
  FarmerPanel,
  FarmerStatusBadge,
  compactCurrency,
  formatShortDate,
} from "@/components/farmer/FarmerDesignSystem";
import { useDashboardData } from "@/hooks/useDashboardData";

function parseAmount(label) {
  const digits = String(label || "").replace(/[^\d.]/g, "");
  return Number(digits || 0);
}

export default function FarmerPaymentsPage() {
  const { data, isLoading } = useDashboardData("farmer");
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <FarmerPanel
          title="Transaction History"
          action={
            <div className="flex gap-3">
              <button type="button" className="inline-flex h-12 items-center gap-2 rounded-lg border border-ink-200 px-4 text-[15px] font-bold text-ink-700">
                Mar 2025
              </button>
              <button type="button" className="inline-flex h-12 items-center gap-2 rounded-lg border border-ink-200 px-4 text-[15px] font-bold text-ink-700">
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
