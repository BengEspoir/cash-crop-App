"use client";

import { TierBadge } from "../ui/badge";
import { ExportReadinessBadge } from "../common/SellerTrustBar";
import { buildListingTrustModel } from "./listingTrustModel";

export function OperationalListingChip({ status, variant = "overlay" }) {
  if (status === "active") {
    const base =
      variant === "overlay"
        ? "border-white/30 bg-black/35 text-white"
        : "border-ink-200 bg-ink-50 text-ink-700";
    return (
      <span
        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm ${base}`}
      >
        Live
      </span>
    );
  }
  if (status === "pending_review") {
    const base =
      variant === "overlay"
        ? "border-amber-300/60 bg-amber-950/50 text-amber-50"
        : "border-amber-200 bg-amber-50 text-amber-900";
    return (
      <span
        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm ${base}`}
      >
        In review
      </span>
    );
  }
  return null;
}

/** Image overlay row: operational + export */
export function ListingImageTrustStrip({ listing }) {
  const model = buildListingTrustModel(listing);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <OperationalListingChip status={listing.status} variant="overlay" />
      {model.exportReady ? <TierBadge status="export_ready" size="sm" /> : null}
    </div>
  );
}

/** Body trust row under title */
export function ListingBodyTrustRibbon({ listing }) {
  const model = buildListingTrustModel(listing);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {model.trustBadge ? (
        <TierBadge status={model.trustBadge.status} size="sm" animated={model.sellerVerified} />
      ) : null}
      {model.listingVerified ? (
        <span
          title="Listing passed platform listing review."
          className="inline-flex items-center rounded-full border border-ink-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-600"
        >
          QC
        </span>
      ) : null}
    </div>
  );
}

/** Compact row for list layout (light background) */
export function ListingRowTrustStrip({ listing }) {
  const model = buildListingTrustModel(listing);
  return (
    <>
      <OperationalListingChip status={listing.status} variant="inline" />
      {model.trustBadge ? (
        <TierBadge status={model.trustBadge.status} size="sm" animated={model.sellerVerified} />
      ) : null}
      <ExportReadinessBadge exportReady={model.exportReady} />
      {model.listingVerified ? (
        <span
          title="Listing passed platform listing review."
          className="rounded-full border border-ink-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-600"
        >
          QC
        </span>
      ) : null}
    </>
  );
}
