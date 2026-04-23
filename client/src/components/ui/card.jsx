import { cn } from "../../lib/utils";

export function Card({ className, interactive = false, elevated = false, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-ink-200 bg-white transition-shadow duration-200",
        elevated ? "shadow-lift" : "shadow-soft",
        interactive && "interactive-card",
        className,
      )}
      {...props}
    />
  );
}
