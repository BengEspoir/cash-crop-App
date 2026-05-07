"use client";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { ChatBubble } from "@/components/messages/ChatBubble";
import { ChatInput } from "@/components/messages/ChatInput";
import { ConversationList } from "@/components/messages/ConversationList";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function FarmerConversationPage({ params }) {
  const { data, isLoading } = useDashboardData("farmer");
  const conversations = data?.conversations || [];
  const conversation = conversations.find((item) => item.id === params.conversationId);

  if (isLoading) {
    return <EmptyState title="Loading live conversation" description="Fetching conversation details from the database." />;
  }

  if (!conversation) {
    return <EmptyState title="Live conversation not found" description="This conversation is not connected to your account." />;
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <ConversationList items={conversations} basePath="/farmer/messages" />
      <div className="space-y-4">
        <PageHeader eyebrow="Conversation" title={conversation.participant} description={conversation.preview} />
        <div className="rounded-[18px] border border-ink-100 bg-white p-5 shadow-soft">
          <div className="space-y-3">
            {(conversation.messages || []).map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
            {!(conversation.messages || []).length ? (
              <p className="text-[14px] text-ink-500">No live messages have been stored for this conversation yet.</p>
            ) : null}
          </div>
          <ChatInput disabled />
        </div>
      </div>
    </section>
  );
}
