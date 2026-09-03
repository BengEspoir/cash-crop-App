"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { DevHintsPanel } from "../../../components/auth/DevHintsPanel";
import { forgotPasswordSchema } from "../../../lib/validators";
import useAuthStore from "../../../store/authStore";
import { TurnstileWidget } from "../../../components/security/TurnstileWidget";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword, onboarding } = useAuthStore();
  const [feedback, setFeedback] = useState({ error: "", success: "" });
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
    defaultValues: { mode: "email", phone: "", email: "" },
  });

  const onSubmit = async (values) => {
    setFeedback({ error: "", success: "" });
    if (process.env.NEXT_PUBLIC_TURNSTILE_ENABLED === "true" && !turnstileToken) {
      setFeedback({ success: "", error: "Complete the bot-protection check to continue." });
      return;
    }

    const result = await forgotPassword({ identifier: values.email, method: "email", turnstileToken });

    if (!result.success) {
      setFeedback({ success: "", error: result.error });
      setTurnstileToken("");
      setTurnstileResetKey((value) => value + 1);
      return;
    }

    setFeedback({ success: result.data.message || "Check your email for a secure reset link.", error: "" });
  };

  return (
    <Card className="rounded-[20px] p-6 sm:p-8">
      <p className="section-eyebrow">Recovery</p>
      <h1 className="mt-2 font-display text-[22px] leading-[1.15] text-[#111827]">Forgot your password?</h1>
      <p className="mt-3 text-[14px] leading-6 text-[#374151]">Enter your verified email and Supabase will send a secure reset link.</p>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label>Email Address</Label>
            <Input placeholder="example@gmail.com" autoComplete="email" {...register("email")} />
            {errors.email ? <p className="mt-2 text-[12px] text-[#922B21]">{errors.email.message}</p> : null}
          </div>

        {feedback.error ? <p className="rounded-[12px] bg-[#FDECEA] px-4 py-3 text-[12px] text-[#922B21]">{feedback.error}</p> : null}
        {feedback.success ? <p className="rounded-[12px] bg-[#D4EDDA] px-4 py-3 text-[12px] text-[#1A5C2E]">{feedback.success}</p> : null}

        <DevHintsPanel hints={onboarding?.devHints} />

        <TurnstileWidget action="password_reset" onTokenChange={setTurnstileToken} resetKey={turnstileResetKey} />

        <Button type="submit" className="w-full" disabled={!isValid || isSubmitting || (process.env.NEXT_PUBLIC_TURNSTILE_ENABLED === "true" && !turnstileToken)}>
          {isSubmitting ? "Sending..." : "Send Reset Option"}
        </Button>

        <Link href="/auth/login" className="inline-flex text-[13px] font-semibold text-[#1A6B3C] hover:text-[#2E8B57]">
          Back to Sign In
        </Link>
      </form>
    </Card>
  );
}
