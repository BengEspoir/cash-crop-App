"use client";

import { cn } from "../../lib/utils";

/**
 * Compact chip-style tab row for filtering collections.
 * Controlled: caller owns `value` and provides `onChange`.
 */
export function FilterTabs({ options = [], value, onChange, className, ariaLabel = "Filter" }) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange?.(option.value)}
            className={cn(
              "focus-ring inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition",
              active
                ? "border-green-700 bg-green-700 text-white shadow-soft"
                : "border-ink-200 bg-white text-ink-700 hover:border-green-300 hover:bg-green-50 hover:text-green-800",
            )}
          >
            <span>{option.label}</span>
            {typeof option.count === "number" ? (
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10.5px] font-semibold",
                  active ? "bg-white/20 text-white" : "bg-ink-100 text-ink-600",
                )}
              >
                {option.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
