/**
 * Precedence-based trust model for listing cards — avoids mixing contradictory trust states.
 * Seller verification dominates; export readiness is orthogonal; listing QC is ancillary.
 */

export const FV = {
  VERIFIED: "verified",
  PENDING_REVIEW: "pending_review",
  REJECTED: "rejected",
  NOT_STARTED: "not_started",
};

/**
 * @param {Record<string, unknown>} listing
 * @returns {{ fv: string; sellerVerified: boolean; exportReady: boolean; listingVerified: boolean; trustBadge: { status: string; key: string } | null }}
 */
export function buildListingTrustModel(listing) {
  const fv = listing.farmerVerificationStatus || FV.NOT_STARTED;
  const sellerVerified = fv === FV.VERIFIED;
  const exportReady = Boolean(listing.exportReady);
  const listingVerified = Boolean(listing.listingVerified);

  let trustBadge = null;
  if (sellerVerified) {
    trustBadge = { status: "verified", key: "seller-verified" };
  } else if (fv === FV.PENDING_REVIEW) {
    trustBadge = { status: "pending_verification", key: "seller-pending" };
  } else if (fv === FV.REJECTED) {
    trustBadge = { status: "rejected", key: "seller-rejected" };
  } else {
    trustBadge = { status: "new_seller", key: "seller-new" };
  }

  return {
    fv,
    sellerVerified,
    exportReady,
    listingVerified,
    trustBadge,
  };
}
