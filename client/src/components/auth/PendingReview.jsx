"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock3, FileCheck2, ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { StatusBadge } from "../common/StatusBadge";
import useAuthStore from "../../store/authStore";

const REVIEW_TIME_MINUTES = 5;

const checkpoints = [
  { title: "Profile review", detail: "We are checking your personal, business, and crop details before approval.", icon: FileCheck2 },
  { title: "Risk and payout check", detail: "Phone and payout information are reviewed for protected order settlement.", icon: ShieldCheck },
  { title: "Final approval", detail: "Your profile is prepared for buyer visibility, notifications, and listing actions.", icon: Clock3 },
];

function formatCountdown(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function PendingReview() {
  const router = useRouter();
  const { user, fetchMe } = useAuthStore();
  const [countdown, setCountdown] = useState(REVIEW_TIME_MINUTES * 60);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Auto-redirect when countdown reaches 0
          router.push("/sign-in");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  // Check status every 30 seconds
  useEffect(() => {
    const checkStatus = async () => {
      setIsChecking(true);
      try {
        const result = await fetchMe();
        if (result.success && result.data?.user?.status === "active") {
          // Account approved - redirect to dashboard
          const dashboardUrl = result.data.user.role === "farmer" 
            ? "/farmer/dashboard" 
            : "/buyer/dashboard";
          router.push(dashboardUrl);
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
        const dashboardUrl = result.data.user.role === "farmer" 
          ? "/farmer/dashboard" 
          : "/buyer/dashboard";
        router.push(dashboardUrl);
      }
    } finally {
      setIsChecking(false);
      setLastChecked(new Date());
    }
  };

  return (
    <Card className="rounded-[20px] p-6 sm:p-8">
      <StatusBadge status="pending" />
      <h1 className="mt-4 font-display text-[22px] leading-[1.15] text-[#111827]">Your account is under review</h1>
      <p className="mt-3 text-[14px] leading-6 text-[#374151]">
        We are checking your registration details, trade readiness, and payout setup before your account is activated.
      </p>

      {/* Countdown Timer */}
      <div className="mt-4 rounded-[12px] bg-[#EAF4EE] px-4 py-3 text-center">
        <p className="text-[13px] text-[#374151]">
          Estimated time remaining: <span className="font-semibold text-[#1A6B3C]">{formatCountdown(countdown)}</span>
        </p>
        <p className="mt-1 text-[12px] text-[#6B7280]">
          You&apos;ll be redirected to sign in once your account is approved
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {checkpoints.map(({ title, detail, icon: Icon }, index) => (
          <div key={title} className="flex gap-4 rounded-[14px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF4EE] text-[#1A6B3C]">
              <Icon className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <p className="text-[15px] font-semibold text-[#111827]">{index + 1}. {title}</p>
              <p className="text-[13px] leading-6 text-[#374151]">{detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button 
          onClick={handleManualCheck}
          disabled={isChecking}
        >
          {isChecking ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            "Check Status"
          )}
        </Button>
        <Button asChild variant="outline">
          <Link href="/sign-in">Go to Sign In</Link>
        </Button>
      </div>

      {lastChecked && (
        <p className="mt-3 text-[12px] text-[#6B7280]">
          Last checked: {lastChecked.toLocaleTimeString()}
        </p>
      )}
    </Card>
  );
}
