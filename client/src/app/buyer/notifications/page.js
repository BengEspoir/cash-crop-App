"use client";

import { Bell, CheckCheck, CreditCard, MessageSquare, Package } from "lucide-react";
import {
  BuyerButton,
  BuyerEmptyState,
  BuyerHeader,
  BuyerPage,
  BuyerPanel,
  BuyerStatusBadge,
  formatBuyerDate,
} from "@/components/buyer/BuyerDesignSystem";
import { useMarkAllNotificationsRead, useNotifications } from "@/hooks/useNotifications";

function notificationIcon(item) {
  const title = String(item?.title || "").toLowerCase();
  if (title.includes("payment")) return CreditCard;
  if (title.includes("message") || title.includes("inquiry")) return MessageSquare;
  if (title.includes("order") || title.includes("shipment")) return Package;
  return Bell;
}

export default function BuyerNotificationsPage() {
  const { data, isLoading } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const notifications = data?.items || [];
  const unread = data?.unreadCount ?? notifications.filter((item) => !item.isRead && item.status !== "verified").length;
  const orderItems = notifications.filter((item) => item.title?.toLowerCase().includes("order") || item.title?.toLowerCase().includes("shipment"));
  const messageItems = notifications.filter((item) => item.title?.toLowerCase().includes("message") || item.title?.toLowerCase().includes("inquiry"));

  return (
    <BuyerPage className="mx-auto max-w-6xl">
      <BuyerHeader
        title="Notifications"
        description={`You have ${unread} unread buyer notifications from live platform activity.`}
        action={
          <BuyerButton
            variant="outline"
            icon={CheckCheck}
            disabled={!unread || markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            Mark all read
          </BuyerButton>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["All notifications", notifications.length, "Live alerts"],
          ["Orders & shipments", orderItems.length, "Sourcing activity"],
          ["Messages", messageItems.length, "Farmer conversations"],
        ].map(([label, value, detail]) => (
          <BuyerPanel key={label} className="transition-all duration-200 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lg" bodyClassName="p-5">
            <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-ink-400">{label}</p>
            <p className="mt-4 font-serif text-[36px] font-bold leading-none text-ink-950">{value}</p>
            <p className="mt-2 text-[15px] text-ink-500">{detail}</p>
          </BuyerPanel>
        ))}
      </div>

      <BuyerPanel title="Notification Center" bodyClassName="p-0">
        {isLoading ? (
          <div className="p-8 text-center text-[16px] text-ink-500">Loading live notifications...</div>
        ) : notifications.length ? (
          <div className="divide-y divide-ink-100">
            {notifications.map((item) => {
              const Icon = notificationIcon(item);
              const unreadItem = item.status !== "verified";
              return (
                <article
                  key={item.id}
                  className="flex gap-5 px-6 py-5 transition-all duration-200 hover:bg-green-50/50 motion-safe:hover:translate-x-1"
                >
                  <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-cyan-800">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h2 className="text-[18px] font-bold text-ink-950">{item.title || "Buyer notification"}</h2>
                      <div className="flex items-center gap-2">
                        {unreadItem ? <span className="h-2.5 w-2.5 rounded-full bg-green-800" /> : null}
                        <BuyerStatusBadge status={item.status || "recorded"}>{item.status || "Recorded"}</BuyerStatusBadge>
                      </div>
                    </div>
                    <p className="mt-2 text-[16px] leading-7 text-ink-600">
                      {item.detail || "Live buyer account activity was recorded."}
                    </p>
                    <p className="mt-3 text-[14px] text-ink-400">{formatBuyerDate(item.createdAt)}</p>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="p-6">
            <BuyerEmptyState
              title="No live notifications yet"
              description="Order, payment, shipment, and message alerts will appear here once the backend records buyer activity."
            />
          </div>
        )}
      </BuyerPanel>
    </BuyerPage>
  );
}
