"use client";

import { SmartImage } from "./SmartImage";
import { cn } from "../../lib/utils";

const sizeMap = {
  sm: "h-9 w-9 text-[11px]",
  md: "h-12 w-12 text-[13px]",
  lg: "h-16 w-16 text-[16px]",
  xl: "h-24 w-24 text-[20px]",
};

export function MediaAvatar({
  src,
  alt,
  initials = "AN",
  size = "md",
  className,
}) {
  const sizeClasses = sizeMap[size] ?? sizeMap.md;

  if (!src) {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#1A6B3C,#2E8B57)] font-semibold text-white",
          sizeClasses,
          className,
        )}
        aria-label={alt}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden rounded-full ring-2 ring-white", sizeClasses, className)}>
      <SmartImage src={src} alt={alt ?? initials} fill sizes="96px" transformOptions={{ c: "fill", g: "face", w: 160, h: 160 }} />
    </div>
  );
}
