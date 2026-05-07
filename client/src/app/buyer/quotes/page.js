"use client";

import { LiveResourceCard, LiveResourcePage } from "@/components/dashboard/LiveResourcePage";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function BuyerQuotesPage() {
  const { data, isLoading } = useDashboardData("buyer");
  const quotes = data?.quotes || [];

  return (
    <LiveResourcePage
      eyebrow="Buyer quotes"
      title="Your live quote requests"
      description="Only real quote requests are shown here."
      items={quotes}
      isLoading={isLoading}
      emptyTitle="No live quotes yet"
      emptyDescription="Quote requests will appear once the inquiry workflow records real buyer activity."
      renderItem={(quote) => (
        <LiveResourceCard
          key={quote.id}
          title={quote.title || quote.crop || "Quote request"}
          detail={quote.message || quote.summary}
          status={quote.status}
        />
      )}
    />
  );
}
