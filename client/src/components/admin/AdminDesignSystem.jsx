"use client";

import {
  ArrowUpRight,
  Download,
  FileText,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const toneClasses = {
  green: {
    box: "bg-green-100 text-green-800",
    pill: "bg-green-100 text-green-800",
    bar: "bg-green-800",
  },
  gold: {
    box: "bg-gold-100 text-gold-800",
    pill: "bg-gold-100 text-gold-800",
    bar: "bg-gold-700",
  },
  blue: {
    box: "bg-blue-50 text-blue-800",
    pill: "bg-blue-50 text-blue-800",
    bar: "bg-blue-800",
  },
  red: {
    box: "bg-red-50 text-red-800",
    pill: "bg-red-50 text-red-800",
    bar: "bg-red-700",
  },
  gray: {
    box: "bg-ink-100 text-ink-600",
    pill: "bg-ink-100 text-ink-700",
    bar: "bg-ink-400",
  },
};

export function adminToneForStatus(status) {
  const value = String(status || "").toLowerCase();
  if (["active", "verified", "confirmed", "success", "released", "approved", "delivered"].some((item) => value.includes(item))) {
    return "green";
  }
  if (["pending", "review", "warning", "awaiting"].some((item) => value.includes(item))) {
    return "gold";
  }
  if (["transit", "escrow", "export", "processing", "auth"].some((item) => value.includes(item))) {
    return "blue";
  }
  if (["failed", "rejected", "dispute", "open", "risk", "cancel"].some((item) => value.includes(item))) {
    return "red";
  }
  return "gray";
}

export function formatAdminDate(value) {
  if (!value) return "Date pending";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatAdminTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRole(value) {
  return String(value || "Unknown").replace(/_/g, " ");
}

export function AdminPageHeader({ title, eyebrow, description, actionLabel = "Export CSV", actionIcon: ActionIcon = Download, children }) {
  return (
    <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="text-[36px] font-bold leading-[1.05] tracking-normal text-ink-900 md:text-[44px]">
          {title}
        </h1>
        {eyebrow ? <p className="mt-2 text-[18px] text-ink-400">{eyebrow}</p> : null}
        {description ? <p className="mt-4 max-w-5xl text-[18px] leading-7 text-ink-500">{description}</p> : null}
      </div>
      {children || actionLabel ? (
        <div className="flex flex-wrap items-center gap-3">
          {children}
          {actionLabel ? (
            <Button type="button" variant="secondary" size="lg" icon={ActionIcon}>
              {actionLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function AdminStatCard({ icon: Icon, value, label, tag, tone = "green", progress = 0 }) {
  const styles = toneClasses[tone] || toneClasses.gray;
  const width = Math.max(6, Math.min(100, Number(progress) || 0));
  return (
    <Card className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 min-h-[190px] rounded-[24px] border-ink-200 p-7 shadow-none transition-all duration-200 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <span className={cn("inline-flex h-14 w-14 items-center justify-center rounded-2xl", styles.box)}>
          {Icon ? <Icon className="h-7 w-7" /> : null}
        </span>
        {tag ? (
          <span className={cn("rounded-full px-4 py-1.5 text-[13px] font-bold", styles.pill)}>
            {tag}
          </span>
        ) : null}
      </div>
      <p className="mt-8 text-[42px] font-semibold leading-none tracking-normal text-ink-900">{value}</p>
      <p className="mt-4 text-[14px] font-bold uppercase tracking-[0.16em] text-ink-500">{label}</p>
      <div className="mt-6 h-2 overflow-hidden rounded-full bg-ink-100">
        <div className={cn("h-full rounded-full", styles.bar)} style={{ width: `${width}%` }} />
      </div>
    </Card>
  );
}

export function AdminCard({ title, subtitle, action, className, children }) {
  return (
    <Card className={cn("motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 rounded-[24px] border-ink-200 shadow-none transition-all duration-200 hover:shadow-sm", className)}>
      {(title || action) ? (
        <div className="flex flex-col gap-3 border-b border-ink-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            {title ? <h2 className="text-[24px] font-bold text-ink-900">{title}</h2> : null}
            {subtitle ? <p className="mt-1 text-[14px] text-ink-500">{subtitle}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </Card>
  );
}

export function AdminToolbar({ searchPlaceholder = "Search records...", filters = [], totalLabel, className }) {
  return (
    <div className={cn("motion-safe:animate-in motion-safe:fade-in flex flex-col gap-3 lg:flex-row lg:items-center", className)}>
      <div className="relative min-h-12 flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
        <input
          type="search"
          placeholder={searchPlaceholder}
          className="h-12 w-full rounded-2xl border border-ink-200 bg-white pl-12 pr-4 text-[14px] text-ink-800 outline-none transition focus:border-green-700 focus:ring-4 focus:ring-green-800/10"
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            className="focus-ring inline-flex h-12 items-center gap-2 rounded-2xl border border-ink-200 bg-white px-4 text-[14px] font-medium text-ink-700 transition-all duration-200 hover:border-green-700 hover:text-green-800 motion-safe:hover:-translate-y-0.5"
          >
            <SlidersHorizontal className="h-4 w-4 text-ink-400" />
            {filter}
          </button>
        ))}
        {totalLabel ? <span className="px-2 text-[14px] text-ink-400">{totalLabel}</span> : null}
      </div>
    </div>
  );
}

export function AdminStatusPill({ status, label }) {
  const tone = adminToneForStatus(status || label);
  const styles = toneClasses[tone] || toneClasses.gray;
  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-[12px] font-bold capitalize", styles.pill)}>
      {label || String(status || "unknown").replace(/[-_]/g, " ")}
    </span>
  );
}

export function AdminDataTable({ columns = [], rows = [], emptyTitle = "No live records yet", emptyDescription, rowKey = "id" }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b border-ink-100 bg-ink-50/60">
            {columns.map((column) => (
              <th key={column.key} className="px-6 py-4 text-left text-[12px] font-bold uppercase tracking-[0.18em] text-ink-400">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row, index) => (
            <tr key={row[rowKey] || index} className="border-b border-ink-100 transition-colors duration-200 hover:bg-green-50/40 last:border-b-0">
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-5 align-middle text-[15px] text-ink-700">
                  {column.render ? column.render(row, index) : row[column.key]}
                </td>
              ))}
            </tr>
          )) : (
            <tr>
              <td colSpan={columns.length} className="px-6 py-14">
                <AdminEmptyPanel title={emptyTitle} description={emptyDescription} />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function AdminEmptyPanel({ title = "No live records yet", description = "Records will appear here when the backend has data for this workspace." }) {
  return (
    <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-ink-50/50 px-6 py-10 text-center transition-colors duration-200 hover:border-green-200 hover:bg-green-50/30">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-800">
        <FileText className="h-7 w-7" />
      </span>
      <h3 className="mt-4 text-[20px] font-bold text-ink-900">{title}</h3>
      {description ? <p className="mt-2 max-w-xl text-[14px] leading-6 text-ink-500">{description}</p> : null}
    </div>
  );
}

export function AdminActionLink({ href, children = "View" }) {
  return (
    <Link href={href} className="focus-ring inline-flex items-center gap-1.5 rounded-md text-[14px] font-bold text-green-800 transition-all duration-200 hover:text-green-700 motion-safe:hover:translate-x-0.5">
      {children}
      <ArrowUpRight className="h-4 w-4" />
    </Link>
  );
}

export function AdminIconTile({ icon: Icon, tone = "blue", title, description }) {
  const styles = toneClasses[tone] || toneClasses.gray;
  return (
    <Card className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 rounded-[24px] border-ink-200 p-7 shadow-none transition-all duration-200 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lg">
      <span className={cn("inline-flex h-16 w-16 items-center justify-center rounded-2xl", styles.box)}>
        {Icon ? <Icon className="h-8 w-8" /> : null}
      </span>
      <h2 className="mt-7 text-[24px] font-bold leading-tight text-ink-900">{title}</h2>
      {description ? <p className="mt-4 text-[16px] leading-7 text-ink-500">{description}</p> : null}
    </Card>
  );
}
