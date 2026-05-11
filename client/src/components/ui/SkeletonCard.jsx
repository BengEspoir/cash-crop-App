"use client";

import { cn } from "../../lib/utils";
import { Skeleton } from "./skeleton";

/**
 * SkeletonCard — Multi-line card skeleton with shimmer
 */
export function SkeletonCard({ className, image = true, lines = 3, badge = true }) {
  return (
    <div className={cn("rounded-2xl border border-ink-200 bg-white p-0 shadow-soft", className)}>
      {image && (
        <Skeleton className="aspect-[4/3] w-full rounded-t-2xl rounded-b-none" />
      )}
      <div className="space-y-3 p-5">
        {badge && <Skeleton className="h-5 w-20 rounded-full" />}
        <Skeleton className="h-4 w-3/4 rounded-md" />
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn("h-3 rounded-md", i === lines - 1 ? "w-1/2" : "w-full")}
          />
        ))}
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * SkeletonKpi — Stat card skeleton
 */
export function SkeletonKpi({ className }) {
  return (
    <div className={cn("rounded-2xl border border-ink-200 bg-white p-5 shadow-soft", className)}>
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-3 w-24 rounded-md" />
        <Skeleton className="h-9 w-9 rounded-[10px]" />
      </div>
      <Skeleton className="mt-3 h-8 w-16 rounded-md" />
      <Skeleton className="mt-3 h-3 w-20 rounded-md" />
    </div>
  );
}

/**
 * SkeletonTable — Table row skeletons
 */
export function SkeletonTable({ rows = 5, columns = 4, className }) {
  return (
    <div className={cn("w-full space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center gap-4 rounded-lg bg-ink-50 px-4 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`h-${i}`} className={cn("h-3 rounded-md", i === 0 ? "w-1/4" : "flex-1")} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 rounded-lg border border-ink-100 px-4 py-3">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton
              key={`${r}-${c}`}
              className={cn("h-3 rounded-md", c === 0 ? "w-1/4" : "flex-1")}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
