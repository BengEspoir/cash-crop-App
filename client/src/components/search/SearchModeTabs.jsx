"use client";

import { Bot, Camera, Mic, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const MODES = [
  { id: "standard", label: "Text", icon: Search, protected: false },
  { id: "ai", label: "Ask AI", icon: Bot, protected: true },
  { id: "image", label: "Image", icon: Camera, protected: true },
  { id: "voice", label: "Voice", icon: Mic, protected: true },
];

export function SearchModeTabs({ value, onChange }) {
  return (
    <div
      className="grid grid-cols-4 gap-1 rounded-xl bg-ink-50 p-1"
      role="tablist"
      aria-label="Marketplace search modes"
    >
      {MODES.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={value === id}
          onClick={() => onChange(id)}
          className={cn(
            "focus-ring inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-2 text-[12px] font-semibold transition sm:text-[13px]",
            value === id
              ? "bg-white text-green-900 shadow-sm"
              : "text-ink-500 hover:bg-white/70 hover:text-green-800",
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  );
}
