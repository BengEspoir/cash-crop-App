"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

export function FAQ({ items }) {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <div className="divide-y divide-ink-200 overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-soft">
      {items.map((item, idx) => {
        const open = openIndex === idx;
        return (
          <button
            type="button"
            key={item.q}
            onClick={() => setOpenIndex(open ? -1 : idx)}
            className="w-full text-left"
          >
            <div className="flex items-start justify-between gap-4 px-5 py-4">
              <span className="font-display text-[15px] leading-[1.3] text-ink-800">{item.q}</span>
              <ChevronDown
                className={cn(
                  "mt-1 h-4 w-4 flex-shrink-0 text-ink-500 transition-transform duration-200",
                  open && "rotate-180 text-green-800",
                )}
              />
            </div>
            <div
              className={cn(
                "grid overflow-hidden px-5 transition-all duration-300 ease-out",
                open ? "grid-rows-[1fr] pb-4" : "grid-rows-[0fr]",
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <p className="text-[13px] leading-6 text-ink-700">{item.a}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
