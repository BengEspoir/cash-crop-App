"use client";

import { LiveResourceCard, LiveResourcePage } from "@/components/dashboard/LiveResourcePage";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function FarmerNotificationsPage() {
  const { data, isLoading } = useDashboardData("farmer");
  const notifications = data?.notifications || [];

  return (
    <LiveResourcePage
      eyebrow="Farmer notifications"
      title="Your live notifications"
      description="Only real notifications for your account are shown here."
      items={notifications}
      isLoading={isLoading}
      emptyTitle="No live notifications yet"
      emptyDescription="System and order notifications will appear as real activity happens."
      renderItem={(item) => (
        <LiveResourceCard key={item.id} title={item.title} detail={item.detail} status={item.status} />
      )}
    />
  );
}
