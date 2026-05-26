"use client";

import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, Phone } from "lucide-react";
import { BuyerEmptyState, BuyerPage, BuyerPanel, BuyerStatusBadge } from "@/components/buyer/BuyerDesignSystem";
import { ChatBubble } from "@/components/messages/ChatBubble";
import { ChatInput } from "@/components/messages/ChatInput";
import { useConversation, useConversations, useSendMessage } from "@/hooks/useMessages";

export default function BuyerConversationPage({ params }) {
  const { data: conversations = [], isLoading: isLoadingList } = useConversations();
  const { data: conversation, isLoading } = useConversation(params.conversationId);
  const sendMessage = useSendMessage();

  const handleSend = async (content) => {
    try {
      await sendMessage.mutateAsync({ conversationId: params.conversationId, content });
      toast.success("Message sent.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Message could not be sent.");
    }
  };

  if (isLoading) {
    return <BuyerEmptyState title="Loading live conversation" description="Fetching conversation details from the database." />;
  }

  if (!conversation) {
    return <BuyerEmptyState title="Live conversation not found" description="This conversation is not connected to your account." />;
  }

  return (
    <BuyerPage className="h-[calc(100vh-112px)] min-h-[720px]">
      <div className="grid h-full overflow-hidden rounded-2xl border border-ink-200 bg-white xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="border-r border-ink-200">
          <div className="flex h-24 items-center gap-3 border-b border-ink-100 px-6">
            <Link href="/buyer/messages" className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-ink-50" aria-label="Back to messages">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-[24px] font-bold text-ink-950">Messages</h1>
          </div>
          <div className="max-h-[calc(100%-96px)] overflow-y-auto">
            {isLoadingList ? (
              <p className="p-6 text-[15px] text-ink-500">Loading conversations...</p>
            ) : conversations.map((item) => (
              <Link
                key={item.id}
                href={`/buyer/messages/${item.id}`}
                className={`flex gap-4 border-b border-ink-100 px-6 py-5 transition hover:bg-green-50/50 ${item.id === conversation.id ? "border-l-4 border-l-green-800 bg-green-50" : ""}`}
              >
                <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-800 text-[17px] font-bold text-white">
                  {(item.participant || "FR").slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[17px] font-bold text-ink-950">{item.participant}</p>
                  <p className="mt-1 truncate text-[15px] text-ink-500">{item.preview}</p>
                </div>
              </Link>
            ))}
          </div>
        </aside>

        <main className="flex min-w-0 flex-col">
          <div className="flex h-24 items-center justify-between border-b border-ink-100 px-7">
            <div className="flex items-center gap-4">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-800 text-[17px] font-bold text-white">
                {(conversation.participant || "FR").slice(0, 2).toUpperCase()}
              </span>
              <div>
                <h2 className="text-[20px] font-bold text-ink-950">{conversation.participant}</h2>
                <p className="text-[15px] text-ink-500">{conversation.role || "Farmer"} conversation</p>
              </div>
            </div>
            <button type="button" className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-ink-200 text-ink-600" aria-label="Call contact">
              <Phone className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-white p-7">
            {conversation.warning ? (
              <BuyerPanel className="mb-8 border-amber-200 bg-amber-50" bodyClassName="p-5">
                <p className="text-[15px] font-semibold text-amber-900">{conversation.warning}</p>
              </BuyerPanel>
            ) : null}
            {conversation.listingId ? (
              <BuyerPanel className="mb-8 border-green-200 bg-green-50" bodyClassName="p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <p className="text-[17px] font-bold text-green-900">Conversation linked to a crop listing.</p>
                  <BuyerStatusBadge status="verified">Listing linked</BuyerStatusBadge>
                </div>
              </BuyerPanel>
            ) : null}
            <div className="space-y-5">
              {(conversation.messages || []).length ? (
                conversation.messages.map((message) => <ChatBubble key={message.id} message={message} />)
              ) : (
                <BuyerEmptyState title="No stored messages yet" description="Send the first message in this conversation." />
              )}
            </div>
          </div>

          <div className="border-t border-ink-100 p-5">
            <ChatInput onSend={handleSend} isSending={sendMessage.isPending} />
          </div>
        </main>
      </div>
    </BuyerPage>
  );
}
