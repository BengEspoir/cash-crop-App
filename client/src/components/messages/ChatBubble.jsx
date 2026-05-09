import { cn } from "../../lib/utils";

export function ChatBubble({ message, currentUser }) {
  const mine = typeof message.mine === "boolean" ? message.mine : message.sender === currentUser;

  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-[75%] rounded-[16px] px-4 py-3 text-[13px] leading-6",
        mine ? "bg-[#1A6B3C] text-white" : "bg-white text-[#111827]",
      )}>
        <p className="font-semibold">{message.sender}</p>
        <p className="mt-1">{message.content}</p>
        <p className={cn("mt-2 text-[11px]", mine ? "text-white/70" : "text-[#6B7280]")}>{message.sentAt}</p>
      </div>
    </div>
  );
}
