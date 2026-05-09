"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Card } from "@/components/ui/card";
import { ConversationList } from "@/components/messages/ConversationList";
import { useConversations } from "@/hooks/useMessages";

export default function BuyerMessagesPage() {
  const { data: conversations = [], isLoading } = useConversations();

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Buyer messages"
        title="Farmer conversations"
        description="Continue stored conversations with farmers connected to listings and quote requests."
      />
      {isLoading ? (
        <Card className="rounded-[16px] p-8 text-center text-ink-500">Loading conversations...</Card>
      ) : conversations.length ? (
        <ConversationList items={conversations} basePath="/buyer/messages" />
      ) : (
        <EmptyState title="No conversations yet" description="Start a chat from a crop listing or farmer profile." />
      )}
    </section>
  );
}
