"use client";

import Link from "next/link";
import { X, Shield, FileWarning, ClipboardList, ArrowUpRight } from "lucide-react";
import { TierBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function statusBadgeStatus(status) {
  const statusMap = {
    active: "verified",
    rejected: "rejected",
    pending_review: "pending",
    pending_verification: "pending_verification",
    pending_identity_verification: "pending_verification",
  };
  return statusMap[status] || "pending_verification";
}

/** v1 heuristic: transparent internal score from account state only */
export function heuristicRiskScore(user) {
  if (!user) return { score: 0, label: "Unknown" };
  let score = 20;
  if (user.status === "pending_review") score += 25;
  if (user.status === "pending_identity_verification") score += 15;
  const phoneVerified = user.phoneVerified ?? user.phone_verified;
  const emailVerified = user.emailVerified ?? user.email_verified;
  if (phoneVerified === false) score += 15;
  if (emailVerified === false) score += 10;
  const label = score >= 60 ? "Elevated scrutiny" : score >= 35 ? "Standard review" : "Low friction";
  return { score: Math.min(100, score), label };
}

function CheckRow({ ok, label }) {
  return (
    <div className="flex items-start gap-2 text-[13px] text-ink-700">
      <span
        className={cn(
          "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
          ok ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-900",
        )}
      >
        {ok ? "OK" : "!"}
      </span>
      <span>{label}</span>
    </div>
  );
}

export function AdminUserReviewDrawer({ user, open, onClose }) {
  if (!open || !user) return null;

  const risk = heuristicRiskScore(user);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-ink-900/45 backdrop-blur-[2px]"
      role="presentation"
      onClick={onClose}
    >
      <aside
        role="dialog"
        aria-modal="true"
        className="relative flex h-full w-full max-w-md flex-col border-l border-ink-200 bg-white shadow-lift motion-safe:animate-slide-in-drawer"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-ink-100 p-5">
          <div className="min-w-0">
            <p className="section-eyebrow">Moderation drawer</p>
            <h2 className="mt-2 font-display text-[22px] text-ink-900">{user.name}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <TierBadge status={statusBadgeStatus(user.status)} size="sm" />
              <span className="rounded-full border border-ink-200 bg-ink-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-600">
                {String(user.role || "").replace(/_/g, " ")}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring rounded-lg p-2 text-ink-500 hover:bg-ink-100 hover:text-ink-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="rounded-xl border border-ink-200 bg-gradient-to-br from-white to-ink-50 p-4">
            <p className="flex items-center gap-2 text-[12px] font-semibold text-ink-800">
              <Shield className="h-4 w-4 text-blue-700" />
              Supplier risk heuristic (internal)
            </p>
            <p className="mt-3 text-[13px] text-ink-700">
              Score <span className="font-bold text-ink-900">{risk.score}</span>/100 — {risk.label}. Derived from verification +
              onboarding flags only — not predictive of fraud.
            </p>
          </div>

          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-500">Export / legitimacy checklist</p>
            <div className="mt-3 space-y-2 rounded-xl border border-ink-100 bg-ink-50/70 p-3">
              <CheckRow ok={Boolean(user.emailVerified ?? user.email_verified)} label="Email verified" />
              <CheckRow ok={Boolean(user.phoneVerified ?? user.phone_verified)} label="Phone verified" />
              <CheckRow ok={user.status !== "pending_identity_verification"} label="Identity stage cleared or not required" />
              <CheckRow ok={user.status === "active"} label="Account active" />
            </div>
          </div>

          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-500">Contact</p>
            <p className="mt-2 text-[13px] text-ink-700">
              {[user.email, user.phone, user.region || user.country].filter(Boolean).join(" | ") || "—"}
            </p>
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50/80 p-3 text-[12.5px] text-amber-950">
            <FileWarning className="mt-0.5 h-4 w-4 shrink-0" />
            <span>For document review and timelines, continue in the dedicated user workspace.</span>
          </div>
        </div>

        <div className="border-t border-ink-100 bg-ink-50/50 p-4 space-y-2">
          <Link
            href={`/admin/users/${user.id}`}
            className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border-transparent bg-green-800 px-4 text-[13px] font-semibold text-white shadow-[0_4px_14px_rgba(26,107,60,0.35)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-[0_6px_20px_rgba(26,107,60,0.45)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-800/15 active:scale-[0.98] motion-reduce:hover:translate-y-0"
          >
            Open full review
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[10px] border border-transparent px-4 text-[13px] font-semibold text-ink-600 hover:bg-ink-100 hover:text-green-800"
            onClick={onClose}
          >
            <ClipboardList className="h-4 w-4 shrink-0" />
            Close drawer
          </button>
        </div>
      </aside>
    </div>
  );
}
