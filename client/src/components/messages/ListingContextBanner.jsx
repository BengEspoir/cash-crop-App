import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card } from "../ui/card";
import { TierBadge } from "../ui/badge";

export function ListingContextBanner({ listing, farmer }) {
  if (!listing) {
    return null;
  }

  const statusMap = {
    active: "active",
    pending_review: "pending",
    draft: "draft",
    rejected: "rejected",
  };

  return (
    <Card variant="elevated" className="rounded-[16px] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="section-eyebrow">Trade context</p>
          <h3 className="mt-2 font-display text-[22px] text-ink-900">{listing.crop}</h3>
          <p className="mt-2 text-[13px] text-ink-600">{listing.summary}</p>
        </div>
        <TierBadge status={statusMap[listing.status] || "draft"} size="sm" />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[12px] bg-ink-50 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">Available quantity</p>
          <p className="mt-2 text-[14px] font-medium text-ink-800">{listing.quantityLabel}</p>
        </div>
        <div className="rounded-[12px] bg-ink-50 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">Location</p>
          <p className="mt-2 text-[14px] font-medium text-ink-800">{listing.location}</p>
        </div>
      </div>

      {farmer ? (
        <Link href={`/farmers/${farmer.id}`} className="mt-4 inline-flex items-center gap-2 text-[13px] font-semibold text-green-800 hover:text-green-700">
          View farmer profile
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      ) : null}
    </Card>
  );
}
