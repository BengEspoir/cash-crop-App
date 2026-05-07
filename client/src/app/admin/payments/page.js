"use client";

import { LiveResourceCard, LiveResourcePage } from "@/components/dashboard/LiveResourcePage";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function AdminPaymentsPage() {
  const { data, isLoading } = useDashboardData("admin");
  const payments = data?.payments || [];

  return (
    <LiveResourcePage
      eyebrow="Admin payments"
      title="Protected payment records"
      description="Live payment and escrow records from the database."
      items={payments}
      isLoading={isLoading}
      emptyTitle="No live payments yet"
      emptyDescription="Payment records will appear once orders begin moving through checkout."
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
