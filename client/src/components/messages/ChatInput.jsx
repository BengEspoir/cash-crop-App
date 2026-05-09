"use client";

import { useState } from "react";
import { Button } from "../ui/button";

export function ChatInput({ disabled = false, onSend, isSending = false }) {
  const [value, setValue] = useState("");
  const canSend = value.trim().length > 0 && !disabled && !isSending;

  const handleSend = async () => {
    if (!canSend) return;
    await onSend?.(value.trim());
    setValue("");
  };

  return (
    <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-4">
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={disabled || isSending}
        rows={3}
        placeholder={disabled ? "Messaging is unavailable for this conversation" : "Type a message"}
        className="w-full resize-none border-0 text-[13px] text-[#111827] outline-none disabled:bg-white disabled:text-[#6B7280]"
      />
      <div className="mt-3 flex justify-end gap-2">
        <Button type="button" variant="secondary" disabled={disabled || isSending} onClick={() => setValue("")}>Clear</Button>
        <Button type="button" disabled={!canSend} onClick={handleSend}>{isSending ? "Sending..." : "Send"}</Button>
      </div>
    </div>
  );
}
