"use client";

import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { TierBadge } from "@/components/ui/badge";

export function LiveResourcePage({
  eyebrow,
  title,
  description,
  items = [],
  isLoading = false,
  emptyTitle = "No live records yet",
  emptyDescription = "This workspace will populate as users create real activity in the system.",
  renderItem,
}) {
  return (
    <section className="space-y-6">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      {isLoading ? (
        <Card className="rounded-[16px] p-8 text-center text-ink-500">Loading live data...</Card>
      ) : items.length ? (
        <div className="grid gap-4">
          {items.map((item) => renderItem(item))}
        </div>
      ) : (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}
    </section>
  );
}

export function LiveResourceCard({ title, subtitle, detail, status, children }) {
  return (
    <Card className="rounded-[16px] p-5 shadow-soft">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="font-display text-[20px] text-ink-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-[13px] text-ink-600">{subtitle}</p> : null}
          {detail ? <p className="mt-2 text-[13px] leading-6 text-ink-700">{detail}</p> : null}
        </div>
        {status ? <TierBadge status={status} label={String(status).replace(/_/g, " ").replace(/-/g, " ")} size="sm" /> : null}
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </Card>
  );
}
