"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock3, FileCheck2, ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { TierBadge } from "../ui/badge";
import { getRoleDashboard } from "../../lib/authRoutes";
import useAuthStore from "../../store/authStore";

const checkpoints = [
  { title: "Identity evidence", detail: "Your submitted ID front, ID back, and selfie are stored for admin review.", icon: FileCheck2 },
  { title: "Risk and payout check", detail: "Phone, profile, and payout information are checked before dashboard access.", icon: ShieldCheck },
  { title: "Final approval", detail: "An admin approval changes your status to active and unlocks the dashboard.", icon: Clock3 },
];

export function PendingReview() {
  const router = useRouter();
  const { user, fetchMe } = useAuthStore();
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  // Check status every 30 seconds
  useEffect(() => {
    const checkStatus = async () => {
      setIsChecking(true);
      try {
        const result = await fetchMe();
        if (result.success && result.data?.user?.status === "active") {
          router.push(getRoleDashboard(result.data.user));
        } else if (!result.success) {
          router.push("/sign-in");
        }
      } catch (error) {
        console.error("Status check failed:", error);
      } finally {
        setIsChecking(false);
        setLastChecked(new Date());
      }
    };

    checkStatus(); // Check immediately
    const interval = setInterval(checkStatus, 30000); // Then every 30 seconds

    return () => clearInterval(interval);
  }, [fetchMe, router]);

  const handleManualCheck = async () => {
    setIsChecking(true);
    try {
      const result = await fetchMe();
      if (result.success && result.data?.user?.status === "active") {
        router.push(getRoleDashboard(result.data.user));
      } else if (!result.success) {
        router.push("/sign-in");
      }
    } finally {
      setIsChecking(false);
      setLastChecked(new Date());
    }
  };

  return (
    <Card variant="elevated" className="rounded-[20px] p-6 sm:p-8">
      <TierBadge status="pending_verification" size="md" />
      <h1 className="mt-4 font-display text-[22px] leading-[1.15] text-ink-900">Your account is under review</h1>
      <p className="mt-3 text-[14px] leading-6 text-ink-600">
        Your verification has been submitted. The admin review queue will decide whether this account becomes active.
      </p>

      <div className="mt-4 rounded-[12px] border border-green-200 bg-green-50 px-4 py-3 text-center">
        <p className="text-[13px] text-ink-600">
          Current status: <span className="font-semibold text-green-800">{user?.status?.replace(/_/g, " ") || "pending review"}</span>
        </p>
        <p className="mt-1 text-[12px] text-ink-500">
          This page checks the live backend every 30 seconds and redirects only after approval.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {checkpoints.map(({ title, detail, icon: Icon }, index) => (
          <div key={title} className="group flex gap-4 rounded-[14px] border border-ink-200 bg-ink-50 px-4 py-4 transition-all duration-200 hover:border-green-200 hover:bg-green-50/30">
            <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-800 transition-colors group-hover:bg-green-800 group-hover:text-white">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[15px] font-semibold text-ink-800">{index + 1}. {title}</p>
              <p className="text-[13px] leading-6 text-ink-600">{detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button
          onClick={handleManualCheck}
          disabled={isChecking}
          variant="cta"
          icon={isChecking ? RefreshCw : undefined}
          isLoading={isChecking}
        >
          {isChecking ? "Checking..." : "Check Status"}
        </Button>
        <Button asChild variant="secondary-ghost">
          <Link href="/sign-in">Go to Sign In</Link>
        </Button>
      </div>

      {lastChecked && (
        <p className="mt-3 text-[12px] text-ink-400">
          Last checked: {lastChecked.toLocaleTimeString()}
        </p>
      )}
    </Card>
  );
}
