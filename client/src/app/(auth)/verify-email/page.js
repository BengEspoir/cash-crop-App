"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, MailCheck } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { StatusBadge } from "../../../components/common/StatusBadge";
import { DevHintsPanel } from "../../../components/auth/DevHintsPanel";
import { getAuthNextRoute } from "../../../lib/authRoutes";
import useAuthStore from "../../../store/authStore";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { onboarding, syncOnboarding, verifyEmail, resendVerification } = useAuthStore();
  const [state, setState] = useState({ status: token ? "processing" : "idle", error: "", success: "" });
  const hasVerificationLink = useMemo(() => Boolean(onboarding?.devHints?.verificationLink), [onboarding]);
  const emailDelivery = onboarding?.emailDelivery;

  useEffect(() => {
    syncOnboarding();
  }, [syncOnboarding]);

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;

    const runVerification = async () => {
      const result = await verifyEmail(token);
      if (cancelled) {
        return;
      }

      if (!result.success) {
        setState({ status: "error", error: result.error, success: "" });
        return;
      }

      setState({ status: "success", error: "", success: result.data.message });
      router.push(getAuthNextRoute(result.data.nextStep, result.data.user));
    };

    runVerification();

    return () => {
      cancelled = true;
    };
  }, [router, token, verifyEmail]);

  const handleResend = async () => {
    const result = await resendVerification("email");
    if (!result.success) {
      setState({ status: "error", error: result.error, success: "" });
      return;
    }

    setState({
      status: "idle",
      error: "",
      success: `A fresh verification link was prepared for ${result.data.target || onboarding?.email || "your inbox"}.`,
    });
  };

  return (
    <Card className="rounded-[20px] p-6 sm:p-8">
      <StatusBadge status={state.status === "success" ? "verified" : "pending"} label="Email step" />
      <div className="mt-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF4EE] text-[#1A6B3C]">
        <MailCheck className="h-6 w-6" />
      </div>
      <h1 className="mt-4 font-display text-[22px] leading-[1.15] text-[#111827]">
        {token ? "Confirming your email" : "Check your email"}
      </h1>
      <p className="mt-3 text-[14px] leading-6 text-[#374151]">
        {token
          ? "We are validating your link now."
          : "We sent a verification link to your inbox. Confirm it to activate quote requests, secure notifications, and buyer messaging."}
      </p>

      <div className="mt-5 rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] p-4 text-[13px] leading-6 text-[#374151]">
        <p className="font-semibold text-[#111827]">What happens next?</p>
        <p className="mt-2">
          Open the email on your phone or desktop, verify the address, and return here to continue onboarding.
        </p>
      </div>

      {emailDelivery?.status === "failed" ? (
        <p className="mt-5 rounded-[12px] bg-[#FDECEA] px-4 py-3 text-[12px] leading-5 text-[#922B21]">
          Account created, but verification email could not be sent. {emailDelivery.message || "Check SMTP credentials, then resend the email."}
        </p>
      ) : null}
      {emailDelivery?.status === "development-fallback" ? (
        <p className="mt-5 rounded-[12px] bg-[#FFF7E0] px-4 py-3 text-[12px] leading-5 text-[#7A4B00]">
          Email was not delivered by a live provider. Use the development verification link below, or configure SMTP and resend.
        </p>
      ) : null}

      {state.error ? <p className="mt-5 rounded-[12px] bg-[#FDECEA] px-4 py-3 text-[12px] text-[#922B21]">{state.error}</p> : null}
      {state.success ? <p className="mt-5 rounded-[12px] bg-[#D4EDDA] px-4 py-3 text-[12px] text-[#1A5C2E]">{state.success}</p> : null}

      <div className="mt-5 space-y-4">
        <DevHintsPanel hints={onboarding?.devHints} />

        <div className="flex flex-wrap gap-3">
          {hasVerificationLink ? (
            <Button asChild>
              <Link href={onboarding.devHints.verificationLink} className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Open Verification Link
              </Link>
            </Button>
          ) : null}
          <Button type="button" variant="outline" onClick={handleResend}>
            Resend Email
          </Button>
        </div>
      </div>
    </Card>
  );
}
