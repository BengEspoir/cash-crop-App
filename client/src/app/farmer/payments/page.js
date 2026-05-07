"use client";

import { LiveResourceCard, LiveResourcePage } from "@/components/dashboard/LiveResourcePage";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function FarmerPaymentsPage() {
  const { data, isLoading } = useDashboardData("farmer");
  const payments = data?.payments || [];

  return (
    <LiveResourcePage
      eyebrow="Farmer payments"
      title="Your live payout records"
      description="Only real payment records connected to your account are shown here."
      items={payments}
      isLoading={isLoading}
      emptyTitle="No live payments yet"
      emptyDescription="Payouts will appear after completed order payment activity."
      renderItem={(payment) => (
        <LiveResourceCard
          key={payment.id}
          title={payment.amountLabel}
          subtitle={payment.channel}
          detail={payment.party}
          status={payment.status}
        />
      )}
    />
  );
}
