"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, MailCheck } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { TierBadge } from "../../../components/ui/badge";
import { DevHintsPanel } from "../../../components/auth/DevHintsPanel";
import { getAuthNextRoute } from "../../../lib/authRoutes";
import useAuthStore from "../../../store/authStore";
import api from "../../../lib/axios";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const mode = searchParams.get("mode");
  const contactType = searchParams.get("type") || "email";
  const value = searchParams.get("value");
  const { onboarding, syncOnboarding, verifyEmail, resendVerification, fetchMe } = useAuthStore();
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
      if (mode === "contact-change") {
        try {
          await api.post("/auth/contact-change/confirm", { type: contactType, value, token });
          const refreshed = await fetchMe();
          if (!cancelled) {
            setState({ status: "success", error: "", success: "Primary email verified and updated." });
            const role = refreshed?.data?.user?.role;
            router.push(role === "farmer" ? "/farmer/profile" : role === "admin" || role === "super_admin" ? "/admin/settings" : "/buyer/profile");
          }
        } catch (error) {
          if (!cancelled) setState({ status: "error", error: error.response?.data?.message || "Email verification failed.", success: "" });
        }
        return;
      }

      if (mode === "recovery-contact") {
        try {
          await api.post("/auth/recovery-contacts/confirm-public", { type: contactType, value, token });
          if (!cancelled) {
            setState({ status: "success", error: "", success: "Recovery email verified. Sign in again with that recovery contact to continue." });
            router.push("/sign-in");
          }
        } catch (error) {
          if (!cancelled) setState({ status: "error", error: error.response?.data?.message || "Recovery email verification failed.", success: "" });
        }
        return;
      }

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
  }, [contactType, fetchMe, mode, router, token, value, verifyEmail]);

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
      <TierBadge status={state.status === "success" ? "verified" : "pending_verification"} label="Email step" size="md" />
      <div className="mt-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-800">
        <MailCheck className="h-6 w-6" />
      </div>
      <h1 className="mt-4 font-display text-[22px] leading-[1.15] text-ink-900">
        {token ? "Confirming your email" : "Check your email"}
      </h1>
      <p className="mt-3 text-[14px] leading-6 text-ink-600">
        {token
          ? "We are validating your link now."
          : "We sent a verification link to your inbox. Confirm it to activate quote requests, secure notifications, and buyer messaging."}
      </p>

      <div className="mt-5 rounded-[12px] border border-ink-200 bg-ink-50 p-4 text-[13px] leading-6 text-ink-600">
        <p className="font-semibold text-ink-800">What happens next?</p>
        <p className="mt-2">
          Open the email on your phone or desktop, verify the address, and return here to continue onboarding.
        </p>
      </div>

      {emailDelivery?.status === "failed" ? (
        <p className="mt-5 rounded-[12px] bg-red-50 px-4 py-3 text-[12px] leading-5 text-red-700">
          Account created, but verification email could not be sent. {emailDelivery.message || "Check SMTP credentials, then resend the email."}
        </p>
      ) : null}
      {emailDelivery?.status === "development-fallback" ? (
        <p className="mt-5 rounded-[12px] bg-gold-50 px-4 py-3 text-[12px] leading-5 text-gold-700">
          Email was not delivered by a live provider. Use the development verification link below, or configure SMTP and resend.
        </p>
      ) : null}

      {state.error ? <p className="mt-5 rounded-[12px] bg-red-50 px-4 py-3 text-[12px] text-red-700">{state.error}</p> : null}
      {state.success ? <p className="mt-5 rounded-[12px] bg-green-50 px-4 py-3 text-[12px] text-green-800">{state.success}</p> : null}

      <div className="mt-5 space-y-4">
        <DevHintsPanel hints={onboarding?.devHints} />

        <div className="flex flex-wrap gap-3">
          {hasVerificationLink ? (
            <Button asChild variant="cta" icon={CheckCircle2}>
              <Link href={onboarding.devHints.verificationLink}>Open Verification Link</Link>
            </Button>
          ) : null}
          <Button type="button" variant="secondary-ghost" onClick={handleResend}>
            Resend Email
          </Button>
        </div>
      </div>
    </Card>
  );
}
