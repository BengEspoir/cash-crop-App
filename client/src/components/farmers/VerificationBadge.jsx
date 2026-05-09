import { AlertTriangle, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { cn } from "../../lib/utils";

const config = {
  verified: {
    label: "Verified Supplier",
    icon: CheckCircle2,
    className: "border-green-200 bg-green-100 text-green-900",
  },
  pending_review: {
    label: "Pending Verification",
    icon: Clock3,
    className: "border-gold-200 bg-gold-100 text-gold-900",
  },
  rejected: {
    label: "Rejected Verification",
    icon: XCircle,
    className: "border-red-200 bg-red-50 text-red-700",
  },
  not_started: {
    label: "Not Verified",
    icon: AlertTriangle,
    className: "border-ink-200 bg-ink-100 text-ink-700",
  },
};

export function VerificationBadge({ status = "not_started", label, className }) {
  const badge = config[status] || config.not_started;
  const Icon = badge.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none",
        badge.className,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label || badge.label}
    </span>
  );
}
