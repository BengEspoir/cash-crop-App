import { TierBadge } from "../ui/badge";

/**
 * OrderStatusBadge — Maps order statuses to TierBadge trust levels
 */
const orderStatusMap = {
  pending_payment: "pending",
  confirmed: "active",
  inspection_in_progress: "pending",
  verified: "verified",
  processing: "active",
  in_transit: "in-transit",
  delivered: "verified",
  completed: "verified",
  cancelled: "rejected",
  disputed: "rejected",
};

export function OrderStatusBadge({ status }) {
  const mappedStatus = orderStatusMap[status] || "draft";
  const label = status?.replace(/[_-]/g, " ") || "Draft";
  return <TierBadge status={mappedStatus} label={label} size="sm" />;
}
