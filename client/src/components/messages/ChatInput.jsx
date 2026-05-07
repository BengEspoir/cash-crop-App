"use client";

import { useState } from "react";
import { Button } from "../ui/button";

export function ChatInput({ disabled = false }) {
  const [value, setValue] = useState("");

  return (
    <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-4">
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={disabled}
        rows={3}
        placeholder={disabled ? "Live message sending is not enabled yet" : "Type a message"}
        className="w-full resize-none border-0 text-[13px] text-[#111827] outline-none disabled:bg-white disabled:text-[#6B7280]"
      />
      <div className="mt-3 flex justify-end">
        <Button type="button" disabled={disabled} onClick={() => setValue("")}>Clear</Button>
      </div>
    </div>
  );
}
