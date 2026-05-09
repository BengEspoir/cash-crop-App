"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Card } from "@/components/ui/card";
import { ConversationList } from "@/components/messages/ConversationList";
import { useConversations } from "@/hooks/useMessages";

export default function FarmerMessagesPage() {
  const { data: conversations = [], isLoading } = useConversations();

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Farmer messages"
        title="Buyer conversations"
        description="Reply to stored buyer conversations connected to your crops and quote requests."
      />
      {isLoading ? (
        <Card className="rounded-[16px] p-8 text-center text-ink-500">Loading conversations...</Card>
      ) : conversations.length ? (
        <ConversationList items={conversations} basePath="/farmer/messages" />
      ) : (
        <EmptyState title="No conversations yet" description="Buyer conversations will appear when shoppers contact you." />
      )}
    </section>
  );
}
