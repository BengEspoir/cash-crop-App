"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { PasswordInput } from "../../../components/auth/PasswordInput";
import { PasswordStrength } from "../../../components/auth/PasswordStrength";
import { DevHintsPanel } from "../../../components/auth/DevHintsPanel";
import { resetPasswordSchema } from "../../../lib/validators";
import useAuthStore from "../../../store/authStore";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { onboarding, resetPassword, syncOnboarding } = useAuthStore();
  const [feedback, setFeedback] = useState({ error: "", success: "" });
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: { code: "", password: "", confirmPassword: "" },
  });

  useEffect(() => {
    syncOnboarding();
  }, [syncOnboarding]);

  const onSubmit = async (values) => {
    setFeedback({ error: "", success: "" });

    if (!token && !onboarding?.identifier) {
      setFeedback({ error: "Start from password recovery so we know which account to reset.", success: "" });
      return;
    }

    const result = await resetPassword({
      password: values.password,
      confirmPassword: values.confirmPassword,
      code: values.code,
      token,
    });

    if (!result.success) {
      setFeedback({ success: "", error: result.error });
      return;
    }

    setFeedback({ success: result.data.message, error: "" });
    router.push("/sign-in");
  };

  return (
    <Card className="rounded-[20px] p-6 sm:p-8">
      <p className="section-eyebrow">Password Reset</p>
      <h1 className="mt-2 font-display text-[22px] leading-[1.15] text-[#111827]">Create a new password</h1>
      <p className="mt-3 text-[14px] leading-6 text-[#374151]">
        {token
          ? "Your email link is active. Choose a stronger password before your next trade."
          : "Use the reset code we sent you and choose a stronger password before your next trade."}
      </p>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
        {!token ? (
          <div>
            <Label>Reset Code</Label>
            <Input placeholder="Enter 6-digit code" autoComplete="one-time-code" {...register("code")} />
            {errors.code ? <p className="mt-2 text-[12px] text-[#922B21]">{errors.code.message}</p> : null}
          </div>
        ) : null}

        <PasswordInput label="New Password" placeholder="At least 8 characters" autoComplete="new-password" error={errors.password?.message} {...register("password")} />
        <PasswordInput label="Confirm Password" placeholder="Repeat password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
        <PasswordStrength password={watch("password") || ""} />

        {feedback.error ? <p className="rounded-[12px] bg-[#FDECEA] px-4 py-3 text-[12px] text-[#922B21]">{feedback.error}</p> : null}
        {feedback.success ? <p className="rounded-[12px] bg-[#D4EDDA] px-4 py-3 text-[12px] text-[#1A5C2E]">{feedback.success}</p> : null}

        <DevHintsPanel hints={onboarding?.devHints} />

        <Button type="submit" className="w-full" disabled={(!token && !isValid) || isSubmitting}>
          {isSubmitting ? "Saving..." : "Set New Password"}
        </Button>
      </form>
    </Card>
  );
}
