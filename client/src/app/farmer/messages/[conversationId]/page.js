"use client";

import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, Phone } from "lucide-react";
import { ChatBubble } from "@/components/messages/ChatBubble";
import { ChatInput } from "@/components/messages/ChatInput";
import { FarmerEmptyState, FarmerPage, FarmerPanel, FarmerStatusBadge } from "@/components/farmer/FarmerDesignSystem";
import { useConversation, useConversations, useSendMessage } from "@/hooks/useMessages";

export default function FarmerConversationPage({ params }) {
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
    return <FarmerEmptyState title="Loading live conversation" description="Fetching conversation details from the database." />;
  }

  if (!conversation) {
    return <FarmerEmptyState title="Live conversation not found" description="This conversation is not connected to your account." />;
  }

  return (
    <FarmerPage className="h-[calc(100vh-112px)] min-h-[720px]">
      <div className="grid h-full overflow-hidden rounded-2xl border border-ink-200 bg-white xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="border-r border-ink-200">
          <div className="flex h-24 items-center gap-3 border-b border-ink-100 px-6">
            <Link href="/farmer/messages" className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-ink-50" aria-label="Back to messages">
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
                href={`/farmer/messages/${item.id}`}
                className={`flex gap-4 border-b border-ink-100 px-6 py-5 transition hover:bg-green-50/50 ${item.id === conversation.id ? "border-l-4 border-l-green-800 bg-green-50" : ""}`}
              >
                <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-cyan-700 text-[17px] font-bold text-white">
                  {(item.participant || "BY").slice(0, 2).toUpperCase()}
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
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-cyan-700 text-[17px] font-bold text-white">
                {(conversation.participant || "BY").slice(0, 2).toUpperCase()}
              </span>
              <div>
                <h2 className="text-[20px] font-bold text-ink-950">{conversation.participant}</h2>
                <p className="text-[15px] text-ink-500">{conversation.role || "Buyer"} conversation</p>
              </div>
            </div>
            <button type="button" className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-ink-200 text-ink-600" aria-label="Call buyer">
              <Phone className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-white p-7">
            {conversation.listingId ? (
              <FarmerPanel className="mb-8 border-green-200 bg-green-50" bodyClassName="p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <p className="text-[17px] font-bold text-green-900">{conversation.preview}</p>
                  <FarmerStatusBadge status="verified">Listing linked</FarmerStatusBadge>
                </div>
              </FarmerPanel>
            ) : null}
            <div className="space-y-5">
              {(conversation.messages || []).map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}
              {!(conversation.messages || []).length ? (
                <FarmerEmptyState title="No stored messages yet" description="The conversation exists, but no message rows are exposed in the current dashboard contract." />
              ) : null}
            </div>
          </div>

          <div className="border-t border-ink-100 p-5">
            <ChatInput onSend={handleSend} isSending={sendMessage.isPending} />
          </div>
        </main>
      </div>
    </FarmerPage>
  );
}
