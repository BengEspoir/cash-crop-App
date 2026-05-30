"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Boxes, Ellipsis, MapPin, Search, UserRound, Package2 } from "lucide-react";
import { BuyerEmptyState, BuyerPage, BuyerStatusBadge } from "@/components/buyer/BuyerDesignSystem";
import { ChatBubble } from "@/components/messages/ChatBubble";
import { ChatInput } from "@/components/messages/ChatInput";
import { MediaAvatar } from "@/components/media/Avatar";
import { useConversation, useConversations, useSendMessage } from "@/hooks/useMessages";
import { useOrders } from "@/hooks/useOrders";

const QUICK_REPLIES = ["Confirm delivery date", "Share tracking details", "Send invoice copy", "Order update please"];

export default function BuyerMessagesPage() {
  const { data: conversations = [], isLoading } = useConversations();
  const { orders = [] } = useOrders();
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const sendMessage = useSendMessage();

  useEffect(() => {
    if (!selectedId && conversations[0]?.id) {
      setSelectedId(conversations[0].id);
    }
  }, [conversations, selectedId]);

  const filteredConversations = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return conversations;
    return conversations.filter((item) => `${item.participant} ${item.preview}`.toLowerCase().includes(needle));
  }, [conversations, search]);

  const selected = filteredConversations.find((item) => item.id === selectedId) || filteredConversations[0];
  const { data: conversation, isLoading: isLoadingConversation } = useConversation(selected?.id);
  const linkedOrder = useMemo(
    () => orders.find((item) => item.listingId && item.listingId === conversation?.listingId),
    [conversation?.listingId, orders],
  );

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
    <BuyerPage className="h-[calc(100vh-118px)] min-h-[760px]">
      <div className="grid h-full overflow-hidden rounded-[28px] border border-ink-200 bg-white xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-r border-ink-200">
          <div className="border-b border-ink-100 px-6 py-7">
            <div className="flex items-center justify-between gap-4">
              <h1 className="font-display text-[30px] text-ink-950">Messages</h1>
              <button type="button" className="rounded-xl border border-ink-200 px-4 py-2 text-[14px] font-semibold text-ink-600">
                All
              </button>
            </div>
            <div className="relative mt-5">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                type="search"
                placeholder="Search conversations..."
                className="h-12 w-full rounded-xl border border-ink-100 bg-ink-50 pl-12 pr-4 text-[15px] outline-none transition focus:border-green-700 focus:bg-white"
              />
            </div>
            <div className="mt-5 flex gap-5 text-[15px]">
              <button type="button" className="border-b-2 border-green-800 pb-2 font-semibold text-green-800">All ({conversations.length})</button>
              <button type="button" className="pb-2 text-ink-400">Unread (0)</button>
              <button type="button" className="pb-2 text-ink-400">Active Orders</button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {isLoading ? (
              <p className="p-6 text-[15px] text-ink-500">Loading conversations...</p>
            ) : filteredConversations.length ? (
              filteredConversations.map((item) => {
                const active = selected?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`flex w-full gap-4 border-b border-ink-100 px-6 py-5 text-left transition ${active ? "border-l-4 border-l-green-800 bg-green-50/70" : "hover:bg-green-50/30"}`}
                  >
                    <MediaAvatar
                      src={item.farmer?.avatarSrc}
                      alt={item.participant}
                      initials={item.participant?.slice(0, 2).toUpperCase()}
                      size="lg"
                      className="h-14 w-14 text-[16px]"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-[18px] font-bold text-ink-950">{item.participant}</p>
                        <p className="text-[13px] text-ink-400">recent</p>
                      </div>
                      <p className="mt-1 truncate text-[16px] text-ink-600">{item.preview}</p>
                      {item.listingId ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <BuyerStatusBadge status="verified">Crop linked</BuyerStatusBadge>
                        </div>
                      ) : null}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-5">
                <BuyerEmptyState title="No conversations found" description="Start a chat from a listing or farmer profile." />
              </div>
            )}
          </div>
        </aside>

        <main className="flex min-h-0 flex-col">
          {selected ? (
            <>
              <div className="border-b border-ink-100 px-6 py-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex items-center gap-4">
                    <MediaAvatar
                      src={conversation?.farmer?.avatarSrc}
                      alt={selected.participant}
                      initials={selected.participant?.slice(0, 2).toUpperCase()}
                      size="xl"
                      className="h-16 w-16 text-[18px]"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="font-display text-[30px] text-ink-950">{selected.participant}</h2>
                        {conversation?.farmer?.verificationStatus ? <VerificationTag status={conversation.farmer.verificationStatus} /> : null}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-4 text-[15px] text-ink-500">
                        <span>Online now</span>
                        {conversation?.farmer?.location ? (
                          <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {conversation.farmer.location}</span>
                        ) : null}
                        <span>{selected.role === "reseller" ? "Reseller" : "Farmer"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {linkedOrder ? (
                      <Link href={`/buyer/orders/${linkedOrder.rawId || linkedOrder.id}`} className="inline-flex h-12 items-center gap-2 rounded-xl border border-ink-200 px-5 text-[15px] font-semibold text-ink-700">
                        <Boxes className="h-4 w-4" /> View Order {linkedOrder.id}
                      </Link>
                    ) : null}
                    {conversation?.farmer?.id ? (
                      <Link href={`/farmers/${conversation.farmer.id}`} className="inline-flex h-12 items-center gap-2 rounded-xl border border-ink-200 px-5 text-[15px] font-semibold text-ink-700">
                        <UserRound className="h-4 w-4" /> View Profile
                      </Link>
                    ) : null}
                    <button type="button" className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-ink-200 text-ink-600">
                      <Ellipsis className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {conversation?.listingId ? (
                  <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-green-200 bg-green-50/60 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                        <Package2 className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-[20px] font-semibold text-green-950">{linkedOrder?.crop || "Listing-linked conversation"}</p>
                        <p className="text-[14px] text-green-900/75">
                          {linkedOrder ? `${linkedOrder.id} · ${linkedOrder.status.replace(/_/g, " ")}` : "Active listing linked to this conversation"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {linkedOrder?.seller?.exportReady ? <BuyerStatusBadge status="verified">Export-ready</BuyerStatusBadge> : null}
                      <Link href={`/crops/${conversation.listingId}`} className="text-[15px] font-semibold text-green-800">View listing</Link>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto bg-white px-6 py-6">
                <div className="mx-auto max-w-4xl space-y-5">
                  {isLoadingConversation ? (
                    <p className="text-[15px] text-ink-500">Loading messages...</p>
                  ) : (conversation?.messages || []).length ? (
                    conversation.messages.map((message) => <ChatBubble key={message.id} message={message} />)
                  ) : (
                    <BuyerEmptyState title="No messages yet" description="Send the first message in this conversation." />
                  )}
                </div>
              </div>

              <div className="border-t border-ink-100 bg-white px-6 py-4">
                <div className="mb-3 flex flex-wrap gap-2">
                  {QUICK_REPLIES.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleSend(item)}
                      className="rounded-full border border-green-800 px-4 py-2 text-[14px] font-semibold text-green-800 transition hover:bg-green-50"
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <ChatInput onSend={handleSend} isSending={sendMessage.isPending} />
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8">
              <BuyerEmptyState title="No conversation selected" description="Choose a conversation to review the order context and reply." />
            </div>
          )}
        </main>
      </div>
    </BuyerPage>
  );
}

function VerificationTag({ status }) {
  const normalized = String(status || "").toLowerCase();
  return (
    <span className={`rounded-full px-3 py-1 text-[13px] font-semibold ${normalized === "verified" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
      {normalized === "verified" ? "Verified" : status}
    </span>
  );
}
