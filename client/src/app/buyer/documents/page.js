"use client";

import { LiveResourceCard, LiveResourcePage } from "@/components/dashboard/LiveResourcePage";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function BuyerDocumentsPage() {
  const { data, isLoading } = useDashboardData("buyer");
  const documents = data?.documents || [];

  return (
    <LiveResourcePage
      eyebrow="Buyer documents"
      title="Your live trade documents"
      description="Only real export and compliance documents are shown here."
      items={documents}
      isLoading={isLoading}
      emptyTitle="No live documents yet"
      emptyDescription="Documents will appear when real orders generate compliance records."
      renderItem={(document) => (
        <LiveResourceCard
          key={document.id}
          title={document.title}
          subtitle={document.type}
          detail={document.fileUrl}
          status={document.status}
        />
      )}
    />
  );
}
