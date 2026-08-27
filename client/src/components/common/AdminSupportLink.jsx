"use client";

import Link from "next/link";
import { LifeBuoy } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { getLoginRoute } from "../../lib/authRoutes";
import { cn } from "../../lib/utils";

export function AdminSupportLink({ listingId, className, compact = false, children = "Contact Support / Admin" }) {
  const { user, isBuyer, isSeller, isAdmin } = useAuth();
  const query = listingId ? `?listingId=${encodeURIComponent(listingId)}#support-ticket-form` : "#support-ticket-form";
  const authenticatedTarget = isBuyer
    ? `/buyer/help-support${query}`
    : isSeller
      ? `/farmer/help-support${query}`
      : isAdmin
        ? "/admin/help-support"
        : "/contact?topic=platform-support";
  const href = user ? authenticatedTarget : getLoginRoute(`/buyer/help-support${query}`);

  return (
    <Link
      href={href}
      className={cn(
        "focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-green-200 font-semibold text-green-800 transition-colors hover:border-green-400 hover:bg-green-50",
        compact ? "min-h-10 px-3 text-[12px]" : "min-h-11 px-4 text-[13px]",
        className,
      )}
    >
      <LifeBuoy className="h-4 w-4" aria-hidden="true" />
      {children}
    </Link>
  );
}
