"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { OtpInput } from "../../../components/auth/OtpInput";
import { verifyPhoneSchema } from "../../../lib/validators";
import { TierBadge } from "../../../components/ui/badge";
import { DevHintsPanel } from "../../../components/auth/DevHintsPanel";
import { getAuthNextRoute } from "../../../lib/authRoutes";
import useAuthStore from "../../../store/authStore";
import api from "../../../lib/axios";

const AUTO_SEND_WINDOW_MS = 10 * 60 * 1000;
const autoSendRequests = new Map();

const getAutoSendStorageKey = (userId) => `agriculnet_phone_otp_auto_sent_${userId}`;

const getDeliveryTarget = (result, onboarding, user) => (
  result?.data?.target || onboarding?.phone || user?.phone || "your phone"
);

const applySuccessfulSendState = ({ result, onboarding, user, setFeedback, setLastTarget, setSendState }) => {
  const target = getDeliveryTarget(result, onboarding, user);
  const deliveryStatus = result?.data?.smsDelivery?.status;

  setLastTarget(target);

  if (deliveryStatus === "development-fallback") {
    setSendState("ready");
    setFeedback({ success: "Development OTP hint generated. Use the hint below or configure live SMS delivery.", error: "" });
    return;
  }

  setSendState("delivered");
  setFeedback({ success: `A new code was sent to ${target}.`, error: "" });
};

const getOrCreateAutoSendRequest = (userId, resendVerification) => {
  const existingRequest = autoSendRequests.get(userId);
  if (existingRequest) {
    return existingRequest;
  }

  const request = resendVerification("phone").finally(() => {
    autoSendRequests.delete(userId);
  });
  autoSendRequests.set(userId, request);
  return request;
};

export default function VerifyPhonePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const contactType = searchParams.get("type") || "phone";
  const contactValue = searchParams.get("value");
  const {
    user,
    onboarding,
    syncOnboarding,
    verifyPhone,
    resendVerification,
    fetchMe,
  } = useAuthStore();
  const [feedback, setFeedback] = useState({ error: "", success: "" });
  const [resending, setResending] = useState(false);
  const [autoSending, setAutoSending] = useState(false);
  const [sendState, setSendState] = useState("idle");
  const [lastTarget, setLastTarget] = useState("");
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(verifyPhoneSchema),
    mode: "onChange",
    defaultValues: { code: "" },
  });

  useEffect(() => {
    syncOnboarding();
  }, [syncOnboarding]);

  useEffect(() => {
    const userId = onboarding?.userId || user?.id;
    const phoneVerified = user?.phone_verified || onboarding?.user?.phone_verified;

    if (mode === "contact-change" || mode === "recovery-contact" || !userId || phoneVerified || autoSending || sendState !== "idle") {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const storageKey = getAutoSendStorageKey(userId);
    const lastSentAt = Number(window.sessionStorage.getItem(storageKey) || 0);
    if (lastSentAt && Date.now() - lastSentAt < AUTO_SEND_WINDOW_MS) {
      setLastTarget(onboarding?.phone || user?.phone || "");
      setSendState("delivered");
      return;
    }

    let cancelled = false;

    const sendInitialCode = async () => {
      setAutoSending(true);
      setSendState("sending");
      setFeedback({ error: "", success: "" });

      const result = await getOrCreateAutoSendRequest(userId, resendVerification);

      if (cancelled) {
        return;
      }

      setAutoSending(false);

      if (!result.success) {
        setSendState("failed");
        setFeedback({ success: "", error: result.error });
        return;
      }

      window.sessionStorage.setItem(storageKey, String(Date.now()));
      applySuccessfulSendState({ result, onboarding, user, setFeedback, setLastTarget, setSendState });
    };

    sendInitialCode();

    return () => {
      cancelled = true;
    };
  }, [autoSending, mode, onboarding, resendVerification, sendState, user]);

  const onSubmit = async (values) => {
    const userId = onboarding?.userId || user?.id;

    if (!userId) {
      setFeedback({ error: "No phone verification session is available. Start from registration or sign-in.", success: "" });
      return;
    }

    setFeedback({ error: "", success: "" });
    if (mode === "contact-change") {
      try {
        await api.post("/auth/contact-change/confirm", {
          type: contactType,
          value: contactValue,
          otp: values.code,
        });
        const refreshed = await fetchMe();
        setFeedback({ success: "Primary phone verified and updated.", error: "" });
        const role = refreshed?.data?.user?.role;
        router.push(role === "farmer" ? "/farmer/profile" : role === "admin" || role === "super_admin" ? "/admin/settings" : "/buyer/profile");
      } catch (error) {
        setFeedback({ success: "", error: error.response?.data?.message || "Phone verification failed." });
      }
      return;
    }

    if (mode === "recovery-contact") {
      try {
        await api.post("/auth/recovery-contacts/confirm-public", {
          type: contactType,
          value: contactValue,
          otp: values.code,
        });
        setFeedback({ success: "Recovery phone verified. Sign in again with that recovery contact to continue.", error: "" });
        router.push("/sign-in");
      } catch (error) {
        setFeedback({ success: "", error: error.response?.data?.message || "Recovery phone verification failed." });
      }
      return;
    }

    const result = await verifyPhone(userId, values.code);

    if (!result.success) {
      setFeedback({ success: "", error: result.error });
      return;
    }

    setFeedback({ success: result.data.message, error: "" });
    router.push(getAuthNextRoute(result.data.nextStep, result.data.user));
  };

  const handleResend = async () => {
    setResending(true);
    setSendState("sending");
    setFeedback({ error: "", success: "" });
    if (mode === "contact-change") {
      try {
        await api.post("/auth/contact-change/request", { type: contactType, value: contactValue });
        setResending(false);
        setSendState("delivered");
        setLastTarget(contactValue || "");
        setFeedback({ success: `A new code was sent to ${contactValue || "the new phone number"}.`, error: "" });
      } catch (error) {
        setResending(false);
        setSendState("failed");
        setFeedback({ success: "", error: error.response?.data?.message || "Could not resend verification code." });
      }
      return;
    }
    if (mode === "recovery-contact") {
      setResending(false);
      setSendState("failed");
      setFeedback({ success: "", error: "Start sign-in again to send a fresh recovery verification code." });
      return;
    }
    const result = await resendVerification("phone");
    setResending(false);

    if (!result.success) {
      setSendState("failed");
      setFeedback({ success: "", error: result.error });
      return;
    }

    const userId = onboarding?.userId || user?.id;
    if (typeof window !== "undefined" && userId) {
      window.sessionStorage.setItem(getAutoSendStorageKey(userId), String(Date.now()));
    }
    applySuccessfulSendState({ result, onboarding, user, setFeedback, setLastTarget, setSendState });
  };

  const deliveryTarget = lastTarget || (mode === "contact-change" || mode === "recovery-contact" ? contactValue : null) || onboarding?.phone || user?.phone || "your phone number";
  const deliveryMessage = sendState === "sending"
    ? "Sending verification code..."
    : sendState === "delivered"
      ? `Code sent to ${deliveryTarget}. Enter it to unlock payouts and trade alerts.`
      : sendState === "failed"
        ? "The code could not be sent. Check the message below, then try sending a new code."
        : `Send a code to ${deliveryTarget} to verify your phone number.`;

  return (
    <Card className="rounded-[20px] p-6 sm:p-8">
      <TierBadge status="pending_verification" label="Phone verification" size="md" />
      <h1 className="mt-4 font-display text-[22px] leading-[1.15] text-ink-900">Enter verification code</h1>
      <p className="mt-3 text-[14px] leading-6 text-ink-600">
        {deliveryMessage}
      </p>

      {onboarding?.smsDelivery?.status === "failed" ? (
        <p className="mt-5 rounded-[12px] bg-red-50 px-4 py-3 text-[12px] leading-5 text-red-700">
          The last SMS code could not be sent. {onboarding.smsDelivery.message || "Check SMS provider credentials, then send a new code."}
        </p>
      ) : null}
      {onboarding?.smsDelivery?.status === "development-fallback" ? (
        <p className="mt-5 rounded-[12px] bg-gold-50 px-4 py-3 text-[12px] leading-5 text-gold-700">
          SMS was not delivered by a live provider. Use the development OTP hint below, or configure SMS credentials and resend.
        </p>
      ) : null}

      <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <OtpInput value={watch("code")} onChange={(nextCode) => setValue("code", nextCode, { shouldValidate: true })} error={errors.code?.message} />

        {feedback.error ? <p className="rounded-[12px] bg-red-50 px-4 py-3 text-[12px] text-red-700">{feedback.error}</p> : null}
        {feedback.success ? <p className="rounded-[12px] bg-green-50 px-4 py-3 text-[12px] text-green-800">{feedback.success}</p> : null}

        <DevHintsPanel hints={onboarding?.devHints} />

        <Button type="submit" variant="cta" className="w-full" disabled={!isValid || isSubmitting} isLoading={isSubmitting}>
          {isSubmitting ? "Verifying..." : "Verify Code"}
        </Button>

        <div className="flex flex-wrap items-center justify-between gap-3 text-[13px] text-ink-500">
          <span>Didn&apos;t get the code?</span>
          <button type="button" onClick={handleResend} disabled={resending || autoSending} className="font-semibold text-green-800 hover:text-green-700 disabled:opacity-50">
            {resending || autoSending ? "Sending..." : "Send a new code"}
          </button>
        </div>
      </form>
    </Card>
  );
}
