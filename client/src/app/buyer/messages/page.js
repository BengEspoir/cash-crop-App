"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Card } from "@/components/ui/card";
import { ConversationList } from "@/components/messages/ConversationList";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function BuyerMessagesPage() {
  const { data, isLoading } = useDashboardData("buyer");
  const conversations = data?.conversations || [];

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Buyer messages"
        title="Live farmer conversations"
        description="Only real conversations connected to your account are shown here."
      />
      {isLoading ? (
        <Card className="rounded-[16px] p-8 text-center text-ink-500">Loading live conversations...</Card>
      ) : conversations.length ? (
        <ConversationList items={conversations} basePath="/buyer/messages" />
      ) : (
        <EmptyState title="No live conversations yet" description="Farmer conversations will appear once messaging activity starts." />
      )}
    </section>
  );
}
