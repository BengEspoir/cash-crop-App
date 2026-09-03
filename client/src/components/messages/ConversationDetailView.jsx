"use client";

import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, Leaf, ShoppingBasket } from "lucide-react";
import { ChatBubble } from "@/components/messages/ChatBubble";
import { ChatInput } from "@/components/messages/ChatInput";
import {
  WorkspaceEmptyState,
  WorkspacePage,
  WorkspacePanel,
  WorkspaceStatusBadge,
} from "@/components/workspace/WorkspacePrimitives";
import { useConversation, useConversations, useSendMessage } from "@/hooks/useMessages";
import { cn } from "@/lib/utils";

const conversationVariants = {
  buyer: {
    basePath: "/buyer/messages",
    avatarClassName: "bg-green-800",
    fallbackInitials: "FR",
    participantRole: "Farmer",
    emptyIcon: ShoppingBasket,
    notFoundDescription: "This conversation is not connected to your account.",
    emptyDescription: "Send the first message in this conversation.",
  },
  farmer: {
    basePath: "/farmer/messages",
    avatarClassName: "bg-cyan-700",
    fallbackInitials: "BY",
    participantRole: "Buyer",
    emptyIcon: Leaf,
    emptyClassName: "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 transition-colors duration-200 hover:border-green-200 hover:bg-green-50/30",
    emptyTitleFontClassName: "font-display",
    notFoundDescription: "This conversation is not connected to your account.",
    emptyDescription:
      "The conversation exists, but no message rows are exposed in the current dashboard contract.",
  },
};

function ConversationEmpty({ description, title, variant }) {
  return (
    <WorkspaceEmptyState
      icon={variant.emptyIcon}
      title={title}
      description={description}
      className={variant.emptyClassName}
      titleFontClassName={variant.emptyTitleFontClassName}
    />
  );
}

function ParticipantAvatar({ participant, variant }) {
  return (
    <span
      className={cn(
        "inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[17px] font-bold text-white",
        variant.avatarClassName,
      )}
    >
      {(participant || variant.fallbackInitials).slice(0, 2).toUpperCase()}
    </span>
  );
}

export function ConversationDetailView({ conversationId, workspace }) {
  const variant = conversationVariants[workspace] || conversationVariants.buyer;
  const { data: conversations = [], isLoading: isLoadingList } = useConversations();
  const { data: conversation, isLoading } = useConversation(conversationId);
  const sendMessage = useSendMessage();

  const handleSend = async (content) => {
    try {
      await sendMessage.mutateAsync({ conversationId, content });
      toast.success("Message sent.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Message could not be sent.");
    }
  };

  if (isLoading) {
    return (
      <ConversationEmpty
        title="Loading live conversation"
        description="Fetching conversation details from the database."
        variant={variant}
      />
    );
  }

  if (!conversation) {
    return (
      <ConversationEmpty
        title="Live conversation not found"
        description={variant.notFoundDescription}
        variant={variant}
      />
    );
  }

  return (
    <WorkspacePage className="h-[calc(100dvh-9rem)] min-h-[34rem] sm:h-[calc(100dvh-7rem)] sm:min-h-[40rem]">
      <div className="grid h-full overflow-hidden rounded-2xl border border-ink-200 bg-white xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="border-r border-ink-200">
          <div className="flex h-24 items-center gap-3 border-b border-ink-100 px-6">
            <Link
              href={variant.basePath}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-ink-50"
              aria-label="Back to messages"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </Link>
            <h1 className="text-[24px] font-bold text-ink-950">Messages</h1>
          </div>
          <div className="max-h-[calc(100%-96px)] overflow-y-auto">
            {isLoadingList ? (
              <p className="p-6 text-[15px] text-ink-500">Loading conversations...</p>
            ) : (
              conversations.map((item) => (
                <Link
                  key={item.id}
                  href={`${variant.basePath}/${item.id}`}
                  className={cn(
                    "flex gap-4 border-b border-ink-100 px-6 py-5 transition hover:bg-green-50/50",
                    item.id === conversation.id && "border-l-4 border-l-green-800 bg-green-50",
                  )}
                >
                  <ParticipantAvatar participant={item.participant} variant={variant} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[17px] font-bold text-ink-950">{item.participant}</p>
                    <p className="mt-1 truncate text-[15px] text-ink-500">{item.preview}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </aside>

        <main className="flex min-w-0 flex-col">
          <div className="flex h-24 items-center justify-between border-b border-ink-100 px-7">
            <div className="flex items-center gap-4">
              <ParticipantAvatar participant={conversation.participant} variant={variant} />
              <div>
                <h2 className="text-[20px] font-bold text-ink-950">{conversation.participant}</h2>
                <p className="text-[15px] text-ink-500">
                  {conversation.role || variant.participantRole} conversation
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-white p-7">
            {workspace === "buyer" && conversation.warning ? (
              <WorkspacePanel className="mb-8 border-amber-200 bg-amber-50" bodyClassName="p-5">
                <p className="text-[15px] font-semibold text-amber-900">{conversation.warning}</p>
              </WorkspacePanel>
            ) : null}
            {conversation.listingId ? (
              <WorkspacePanel className="mb-8 border-green-200 bg-green-50" bodyClassName="p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <p className="text-[17px] font-bold text-green-900">
                    {workspace === "farmer"
                      ? conversation.preview
                      : "Conversation linked to a crop listing."}
                  </p>
                  <WorkspaceStatusBadge status="verified">Listing linked</WorkspaceStatusBadge>
                </div>
              </WorkspacePanel>
            ) : null}
            <div className="space-y-5">
              {(conversation.messages || []).map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}
              {!(conversation.messages || []).length ? (
                <ConversationEmpty
                  title="No stored messages yet"
                  description={variant.emptyDescription}
                  variant={variant}
                />
              ) : null}
            </div>
          </div>

          <div className="border-t border-ink-100 p-5">
            <ChatInput onSend={handleSend} isSending={sendMessage.isPending} />
          </div>
        </main>
      </div>
    </WorkspacePage>
  );
}
