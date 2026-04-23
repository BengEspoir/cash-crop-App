import { cn } from "../../lib/utils";

export function Skeleton({ className }) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative overflow-hidden rounded-md bg-ink-100",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.4s_linear_infinite] before:bg-shimmer-gradient before:content-['']",
        className,
      )}
    />
  );
}
