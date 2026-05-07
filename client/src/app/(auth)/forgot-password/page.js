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
import { PhoneInput } from "../../../components/auth/PhoneInput";
import { RoleSwitcher } from "../../../components/auth/RoleSwitcher";
import { DevHintsPanel } from "../../../components/auth/DevHintsPanel";
import { formatPhoneInternational } from "../../../lib/countries";
import { forgotPasswordSchema } from "../../../lib/validators";
import useAuthStore from "../../../store/authStore";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword, onboarding } = useAuthStore();
  const [mode, setMode] = useState("phone");
  const [selectedCountry, setSelectedCountry] = useState("CM");
  const [feedback, setFeedback] = useState({ error: "", success: "" });
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
    defaultValues: { mode: "phone", phone: "", email: "" },
  });

  const onSubmit = async (values) => {
    setFeedback({ error: "", success: "" });

    let identifier = values.email;
    if (values.mode === "phone") {
      identifier = selectedCountry === "CM"
        ? values.phone
        : formatPhoneInternational(values.phone, selectedCountry);
    }

    const method = values.mode === "phone" ? "sms" : "email";
    const result = await forgotPassword({ identifier, method });

    if (!result.success) {
      setFeedback({ success: "", error: result.error });
      return;
    }

    setFeedback({ success: result.data.message, error: "" });
    router.push("/reset-password");
  };

  return (
    <Card className="rounded-[20px] p-6 sm:p-8">
      <p className="section-eyebrow">Recovery</p>
      <h1 className="mt-2 font-display text-[22px] leading-[1.15] text-[#111827]">Forgot your password?</h1>
      <p className="mt-3 text-[14px] leading-6 text-[#374151]">Choose your preferred recovery channel and we will send a secure reset option.</p>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <RoleSwitcher
          value={mode}
          onChange={(nextMode) => {
            setMode(nextMode);
            setValue("mode", nextMode, { shouldValidate: true });
          }}
          options={[
            { label: "Phone Number", value: "phone" },
            { label: "Email Address", value: "email" },
          ]}
        />

        {mode === "phone" ? (
          <PhoneInput
            label="Phone Number"
            value={watch("phone")}
            onChange={(nextPhone) => setValue("phone", nextPhone, { shouldValidate: true })}
            error={errors.phone?.message}
            countryCode={selectedCountry}
            onCountryChange={setSelectedCountry}
            showCountrySelector={true}
            includeAllCountries={true}
          />
        ) : (
          <div>
            <Label>Email Address</Label>
            <Input placeholder="example@gmail.com" autoComplete="email" {...register("email")} />
            {errors.email ? <p className="mt-2 text-[12px] text-[#922B21]">{errors.email.message}</p> : null}
          </div>
        )}

        {feedback.error ? <p className="rounded-[12px] bg-[#FDECEA] px-4 py-3 text-[12px] text-[#922B21]">{feedback.error}</p> : null}
        {feedback.success ? <p className="rounded-[12px] bg-[#D4EDDA] px-4 py-3 text-[12px] text-[#1A5C2E]">{feedback.success}</p> : null}

        <DevHintsPanel hints={onboarding?.devHints} />

        <Button type="submit" className="w-full" disabled={!isValid || isSubmitting}>
          {isSubmitting ? "Sending..." : "Send Reset Option"}
        </Button>

        <Link href="/sign-in" className="inline-flex text-[13px] font-semibold text-[#1A6B3C] hover:text-[#2E8B57]">
          Back to Sign In
        </Link>
      </form>
    </Card>
  );
}
