"use client";

import Link from "next/link";
import toast from "react-hot-toast";
import { Phone, Search } from "lucide-react";
import {
  FarmerEmptyState,
  FarmerPage,
  FarmerPanel,
  FarmerStatusBadge,
} from "@/components/farmer/FarmerDesignSystem";
import { ChatBubble } from "@/components/messages/ChatBubble";
import { ChatInput } from "@/components/messages/ChatInput";
import { useConversation, useConversations, useSendMessage } from "@/hooks/useMessages";

export default function FarmerMessagesPage() {
  const { data: conversations = [], isLoading } = useConversations();
  const selected = conversations[0];
  const { data: conversation, isLoading: isLoadingConversation } = useConversation(selected?.id);
  const sendMessage = useSendMessage();

  const handleSend = async (content) => {
    if (!selected?.id) return;
    try {
      await sendMessage.mutateAsync({ conversationId: selected.id, content });
      toast.success("Message sent.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Message could not be sent.");
    }
  };

  return (
    <FarmerPage className="h-[calc(100vh-112px)] min-h-[720px]">
      <div className="grid h-full overflow-hidden rounded-2xl border border-ink-200 bg-white xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="border-r border-ink-200">
          <div className="flex h-24 items-center justify-between border-b border-ink-100 px-6">
            <h1 className="text-[24px] font-bold text-ink-950">Messages</h1>
            <button type="button" className="rounded-lg border border-ink-200 px-4 py-2 text-[15px] font-medium text-ink-700">All</button>
          </div>
          <div className="border-b border-ink-100 p-5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
              <input
                type="search"
                placeholder="Search conversations..."
                className="h-14 w-full rounded-lg border border-ink-100 bg-ink-50 pl-12 pr-4 text-[15px] outline-none focus:border-green-700 focus:bg-white"
              />
            </div>
          </div>
          <div className="max-h-[calc(100%-180px)] overflow-y-auto">
            {isLoading ? (
              <p className="p-6 text-[15px] text-ink-500">Loading conversations...</p>
            ) : conversations.length ? (
              conversations.map((item, index) => (
                <Link
                  key={item.id}
                  href={`/farmer/messages/${item.id}`}
                  className={`flex gap-4 border-b border-ink-100 px-6 py-5 transition hover:bg-green-50/50 ${index === 0 ? "border-l-4 border-l-green-800 bg-green-50" : ""}`}
                >
                  <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-cyan-700 text-[17px] font-bold text-white">
                    {(item.participant || "BY").slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-[17px] font-bold text-ink-950">{item.participant}</p>
                      {item.unread ? <span className="rounded-full bg-green-800 px-2 py-0.5 text-[12px] font-bold text-white">{item.unread}</span> : null}
                    </div>
                    <p className="mt-1 truncate text-[15px] text-ink-500">{item.preview}</p>
                    {item.listingId ? <FarmerStatusBadge status="verified" className="mt-2">Listing linked</FarmerStatusBadge> : null}
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-5">
                <FarmerEmptyState title="No conversations yet" description="Buyer conversations will appear when shoppers contact you." />
              </div>
            )}
          </div>
        </aside>

        <main className="flex min-w-0 flex-col">
          {selected ? (
            <>
              <div className="flex h-24 items-center justify-between border-b border-ink-100 px-7">
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-cyan-700 text-[17px] font-bold text-white">
                    {(selected.participant || "BY").slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <h2 className="text-[20px] font-bold text-ink-950">{selected.participant}</h2>
                    <p className="text-[15px] text-ink-500">{selected.role || "Buyer"} conversation</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link href={`/farmer/messages/${selected.id}`} className="inline-flex h-12 items-center rounded-lg border border-ink-200 px-5 text-[15px] font-bold text-ink-700">Open Thread</Link>
                  <button type="button" className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-ink-200 text-ink-600" aria-label="Call buyer"><Phone className="h-5 w-5" /></button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto bg-white p-7">
                {conversation?.listingId ? (
                  <FarmerPanel className="border-green-200 bg-green-50" bodyClassName="p-5">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-[17px] font-bold text-green-900">Conversation linked to a crop listing.</p>
                      <Link href={`/farmer/messages/${selected.id}`} className="text-[15px] font-bold text-green-800">Open thread</Link>
                    </div>
                  </FarmerPanel>
                ) : null}
                <div className="mt-10 space-y-5">
                  {isLoadingConversation ? (
                    <p className="text-[15px] text-ink-500">Loading messages...</p>
                  ) : (conversation?.messages || []).length ? (
                    conversation.messages.map((message) => <ChatBubble key={message.id} message={message} />)
                  ) : (
                    <FarmerEmptyState title="No messages yet" description="Send the first message in this conversation." />
                  )}
                </div>
              </div>
              <div className="border-t border-ink-100 p-5">
                <ChatInput onSend={handleSend} isSending={sendMessage.isPending} />
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8">
              <FarmerEmptyState title="No conversation selected" description="Live buyer conversations will appear here after buyers contact you." />
            </div>
          )}
        </main>
      </div>
    </FarmerPage>
  );
}
