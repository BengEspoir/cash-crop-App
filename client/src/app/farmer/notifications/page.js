"use client";

import { CheckCheck } from "lucide-react";
import {
  FarmerButton,
  FarmerEmptyState,
  FarmerHeader,
  FarmerNotificationItem,
  FarmerPage,
  FarmerTabs,
} from "@/components/farmer/FarmerDesignSystem";
import { useMarkAllNotificationsRead, useNotifications } from "@/hooks/useNotifications";

export default function FarmerNotificationsPage() {
  const { data, isLoading } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const notifications = data?.items || [];
  const unread = data?.unreadCount ?? notifications.filter((item) => !item.isRead && item.status !== "verified").length;
  const orderItems = notifications.filter((item) => item.title?.toLowerCase().includes("order"));
  const messageItems = notifications.filter((item) => item.title?.toLowerCase().includes("message") || item.title?.toLowerCase().includes("inquiry"));

  return (
    <FarmerPage className="mx-auto max-w-6xl">
      <FarmerHeader
        title="Notifications"
        description={`You have ${unread} unread notifications`}
        action={
          <FarmerButton
            variant="outline"
            icon={CheckCheck}
            disabled={!unread || markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            Mark all read
          </FarmerButton>
        }
      />

      <FarmerTabs
        active="all"
        tabs={[
          { id: "all", label: `All (${notifications.length})` },
          { id: "orders", label: `Orders (${orderItems.length})` },
          { id: "messages", label: `Messages (${messageItems.length})` },
          { id: "system", label: "System" },
        ]}
      />

      {isLoading ? (
        <div className="rounded-2xl border border-ink-200 bg-white p-8 text-center text-[16px] text-ink-500">Loading live notifications...</div>
      ) : notifications.length ? (
        <div className="space-y-5">
          {notifications.map((item) => (
            <FarmerNotificationItem key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <FarmerEmptyState title="No live notifications yet" description="System and order notifications will appear as real activity happens." />
      )}
    </FarmerPage>
  );
}
