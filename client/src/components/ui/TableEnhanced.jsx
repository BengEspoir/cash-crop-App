"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../../lib/utils";
import { Skeleton } from "./skeleton";

/**
 * TableEnhanced — Enterprise table with sortable columns, row hover, and inline expansion
 */

export function TableEnhanced({ children, className }) {
  return (
    <div className={cn("w-full overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-soft", className)}>
      <table className="w-full text-left text-[13px]">{children}</table>
    </div>
  );
}

export function TableHeader({ children, className }) {
  return (
    <thead className={cn("border-b border-ink-200 bg-ink-50", className)}>
      <tr>{children}</tr>
    </thead>
  );
}

export function TableHeaderCell({
  children,
  className,
  sortable,
  sortDirection,
  onSort,
  align = "left",
}) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-500",
        sortable && "cursor-pointer select-none transition-colors hover:text-ink-800",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
      onClick={sortable ? onSort : undefined}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortable && (
          <span className="inline-flex flex-col">
            <ChevronUp
              className={cn(
                "h-3 w-3 -mb-1 transition-colors",
                sortDirection === "asc" ? "text-green-700" : "text-ink-300",
              )}
            />
            <ChevronDown
              className={cn(
                "h-3 w-3 transition-colors",
                sortDirection === "desc" ? "text-green-700" : "text-ink-300",
              )}
            />
          </span>
        )}
      </span>
    </th>
  );
}

export function TableBody({ children, className }) {
  return <tbody className={cn("divide-y divide-ink-100", className)}>{children}</tbody>;
}

export function TableRow({
  children,
  className,
  expanded,
  onClick,
  selected,
  interactive = true,
}) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        "transition-colors duration-150",
        interactive && "cursor-pointer hover:bg-green-50/40",
        selected && "bg-green-50/60",
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className, align = "left" }) {
  return (
    <td
      className={cn(
        "px-4 py-3 text-ink-700",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
    >
      {children}
    </td>
  );
}

/**
 * Sortable hook for tables
 */
export function useTableSort(data, initialKey = null, initialDir = "asc") {
  const [sortKey, setSortKey] = useState(initialKey);
  const [sortDir, setSortDir] = useState(initialDir);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey];
    const bVal = b[sortKey];

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    }

    const aStr = String(aVal ?? "").toLowerCase();
    const bStr = String(bVal ?? "").toLowerCase();
    if (aStr < bStr) return sortDir === "asc" ? -1 : 1;
    if (aStr > bStr) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  return { sorted, sortKey, sortDir, handleSort };
}

/**
 * Table skeleton loader
 */
export function TableSkeleton({ columns = 4, rows = 5 }) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-soft">
      <table className="w-full">
        <thead className="border-b border-ink-200 bg-ink-50">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <Skeleton className="h-3 w-16 rounded-md" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: columns }).map((_, c) => (
                <td key={c} className="px-4 py-3">
                  <Skeleton className={cn("h-3 rounded-md", c === 0 ? "w-24" : "w-full")} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
