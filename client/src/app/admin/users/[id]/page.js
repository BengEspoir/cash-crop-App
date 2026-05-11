"use client";

import { useState } from "react";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { PageHeader } from "@/components/common/PageHeader";
import { TierBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminReviewUser, useDashboardData } from "@/hooks/useDashboardData";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const REVIEW_ACTIONS = [
  { action: "approve", label: "Approve" },
  { action: "reject", label: "Reject" },
  { action: "flag", label: "Request ID Again" },
  { action: "ban", label: "Ban" },
];

export default function AdminUserDetailPage({ params }) {
  const { data, isLoading } = useDashboardData("admin");
  const reviewMutation = useAdminReviewUser();
  const [reason, setReason] = useState("");
  const [activeDoc, setActiveDoc] = useState(null);
  const users = [...(data?.users || []), ...(data?.pendingUsers || [])];
  const user = users.find((item) => item.id === params.id);
  const profile = user?.profile || user?.farmer_profiles?.[0] || user?.farmer_profiles || null;

  const handleReview = (action) => {
    reviewMutation.mutate({ userId: params.id, action, reason });
  };

  if (isLoading) {
    return <Card className="rounded-[16px] p-8 text-center text-ink-500">Loading live user...</Card>;
  }

  if (!user) {
    return (
      <EmptyState
        title="Live user not found"
        description="This user is not present in the current database response."
      />
    );
  }

  return (
    <section className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Users", href: "/admin/users" },
          { label: user.name },
        ]}
      />

      <PageHeader
        eyebrow="User detail"
        title={`${user.name} profile review`}
        description="Inspect live account status, verification uploads, and apply admin review decisions."
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="rounded-[18px] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-eyebrow">{user.id}</p>
              <h2 className="mt-2 font-display text-[24px] text-[#111827]">{user.name}</h2>
            </div>
            <TierBadge
              status={user.status === "active" ? "verified" : user.status === "rejected" ? "rejected" : "pending"}
              label={user.status?.replace(/_/g, " ")}
              size="md"
            />
          </div>

          <div className="mt-5 space-y-3">
            {[
              ["Role", user.role?.replace(/_/g, " ")],
              ["Email", user.email || "Not provided"],
              ["Phone", user.phone || "Not provided"],
              ["Region", user.region || user.country || "Not provided"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[12px] bg-[#F9FAFB] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">{label}</p>
                <p className="mt-2 text-[14px] font-medium text-[#111827]">{value}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-[18px] p-5">
          <h2 className="font-display text-[22px] text-[#111827]">Verification evidence</h2>
          <div className="mt-5 grid gap-3">
            {[
              ["ID front", profile?.id_front_url],
              ["ID back", profile?.id_back_url],
              ["Selfie", profile?.selfie_url],
              ["Submitted at", profile?.verification_submitted_at],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[12px] border border-[#E5E7EB] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">{label}</p>
                {value && String(value).startsWith("http") ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <a
                      href={value}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex text-[13px] font-semibold text-green-800 hover:text-green-700"
                    >
                      Open in new tab
                    </a>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex rounded-[10px] border border-ink-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-ink-700 hover:bg-ink-50"
                          onClick={() => setActiveDoc({ label, url: value })}
                        >
                          Preview
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[920px] p-0 overflow-hidden">
                        <div className="p-6">
                          <DialogHeader>
                            <DialogTitle>{activeDoc?.label || "Document preview"}</DialogTitle>
                            <DialogDescription>
                              Review this file in-context, then apply an approval decision.
                            </DialogDescription>
                          </DialogHeader>
                        </div>
                        <div className="border-t border-ink-100 bg-ink-50/40 p-4">
                          <div className="rounded-[14px] border border-ink-200 bg-white p-3">
                            <img
                              src={activeDoc?.url || value}
                              alt={activeDoc?.label || label}
                              className="max-h-[70vh] w-full rounded-[12px] object-contain"
                            />
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <p className="mt-2 text-[14px] text-[#374151]">{value || "Not submitted"}</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-5">
            <label className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">Review reason</label>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="mt-2 min-h-[90px] w-full rounded-[12px] border border-[#D1D5DB] px-3 py-3 text-[14px] outline-none focus:border-[#1A6B3C]"
              placeholder="Optional note for rejection, flagging, or banning"
            />
            <div className="mt-4 flex flex-wrap gap-3">
              {REVIEW_ACTIONS.map((item) => (
                <Button
                  key={item.action}
                  type="button"
                  variant={item.action === "approve" ? "primary" : "outline"}
                  disabled={reviewMutation.isPending}
                  onClick={() => handleReview(item.action)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
            {reviewMutation.isSuccess ? (
              <p className="mt-3 rounded-[12px] bg-[#D4EDDA] px-4 py-3 text-[12px] text-[#1A5C2E]">
                Review action saved.
              </p>
            ) : null}
            {reviewMutation.isError ? (
              <p className="mt-3 rounded-[12px] bg-[#FDECEA] px-4 py-3 text-[12px] text-[#922B21]">
                {reviewMutation.error?.response?.data?.message || "Review action failed."}
              </p>
            ) : null}
          </div>
        </Card>
      </div>
    </section>
  );
}
