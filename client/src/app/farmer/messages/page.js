"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Card } from "@/components/ui/card";
import { ConversationList } from "@/components/messages/ConversationList";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function FarmerMessagesPage() {
  const { data, isLoading } = useDashboardData("farmer");
  const conversations = data?.conversations || [];

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Farmer messages"
        title="Live buyer conversations"
        description="Only real conversations connected to your account are shown here."
      />
      {isLoading ? (
        <Card className="rounded-[16px] p-8 text-center text-ink-500">Loading live conversations...</Card>
      ) : conversations.length ? (
        <ConversationList items={conversations} basePath="/farmer/messages" />
      ) : (
        <EmptyState title="No live conversations yet" description="Buyer conversations will appear once messaging activity starts." />
      )}
    </section>
  );
}
