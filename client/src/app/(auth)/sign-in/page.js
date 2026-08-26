"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { PasswordInput } from "../../../components/auth/PasswordInput";
import { PhoneInput } from "../../../components/auth/PhoneInput";
import { Reveal, Stagger, StaggerItem } from "../../../components/motion/Reveal";
import { signInSchema } from "../../../lib/validators";
import { getAuthNextRoute } from "../../../lib/authRoutes";
import useAuthStore from "../../../store/authStore";
import { useI18n } from "../../../i18n/I18nProvider";
import { Apple, ArrowRight, Globe2 } from "lucide-react";
import { startOAuth } from "../../../lib/startOAuth";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const { login } = useAuthStore();
  const [submitError, setSubmitError] = useState("");
  const submittingRef = useRef(false);
  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(signInSchema),
    mode: "onChange",
    defaultValues: {
      mode: "phone",
      phone: "",
      email: "",
      password: "",
    },
  });
  const mode = watch("mode");
  const returnTo = searchParams.get("next");

  const onSubmit = async (values) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitError("");
    try {
      const identifier = values.mode === "phone" ? values.phone : values.email;
      const result = await login(identifier, values.password, values.mode);

      if (!result.success) {
        setSubmitError(result.error);
        return;
      }

      if (result.data?.requiresRecoveryContactVerification) {
        const params = new URLSearchParams({
          mode: "recovery-contact",
          type: result.data.type,
          value: identifier,
        });
        router.push(result.data.type === "email" ? `/verify-email?${params}` : `/verify-phone?${params}`);
        return;
      }

      router.push(getAuthNextRoute(result.data.nextStep, result.data.user, returnTo));
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <div className="w-full">
      <Reveal inView={false} className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="inline-flex rounded-full bg-[#EAF4EC] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#1E5E27]">{t("auth.welcomeBack")}</p>
          <h1 className="mt-4 font-display text-[34px] leading-[1.08] text-[#111827]">{t("auth.signInTitle")}</h1>
          <p className="mt-3 max-w-[46ch] text-[13px] leading-6 text-[#6B7280]">{t("auth.signInSubtitle")}</p>
        </div>
        <p className="text-[13px] text-ink-700">
          {t("auth.newHere")}{" "}
          <Link href={returnTo ? `/register?next=${encodeURIComponent(returnTo)}` : "/register"} className="font-semibold text-green-800 hover:text-green-700">
            {t("auth.register")}
          </Link>
        </p>
      </Reveal>

      <Stagger as="form" className="mt-7 space-y-5" onSubmit={handleSubmit(onSubmit)} delay={0.08}>
        <StaggerItem className="grid grid-cols-2 rounded-[8px] bg-[#F7F8F7] p-1" role="tablist" aria-label="Sign-in method">
          {["phone", "email"].map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={mode === value}
              onClick={() => setValue("mode", value, { shouldValidate: true })}
              className={`rounded-[7px] px-3 py-2.5 text-[12px] font-semibold capitalize transition ${mode === value ? "bg-[#1E5E27] text-white shadow-sm" : "text-ink-600"}`}
            >
              {value}
            </button>
          ))}
        </StaggerItem>

        <StaggerItem>
          {mode === "phone" ? (
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  label="Phone number"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.phone?.message}
                  helper="Use the Cameroon number linked to your account."
                  appearance="reference"
                />
              )}
            />
          ) : (
            <div>
              <Label>{t("auth.emailLabel")}</Label>
              <Input className="h-12 border-transparent bg-[#F6F7F6] focus:border-[#1E5E27] focus:ring-2 focus:ring-[#1E5E27]/10" placeholder={t("auth.emailPlaceholder")} autoComplete="email" {...register("email")} />
              {errors.email ? <p className="mt-2 text-[12px] text-[#922B21]">{errors.email.message}</p> : null}
            </div>
          )}
        </StaggerItem>

        <StaggerItem>
          <PasswordInput appearance="reference" label={t("auth.passwordLabel")} placeholder={t("auth.passwordPlaceholder")} autoComplete="current-password" error={errors.password?.message} {...register("password")} />
        </StaggerItem>

        <StaggerItem className="flex flex-wrap items-center justify-between gap-3 text-[13px]">
          <Link href={returnTo ? `/forgot-password?next=${encodeURIComponent(returnTo)}` : "/forgot-password"} className="font-semibold text-green-800 hover:text-green-700">
            {t("auth.forgotPassword")}
          </Link>
          <span className="text-[11px] text-ink-500">A verification code may be required after sign in.</span>
        </StaggerItem>

        {submitError ? (
          <StaggerItem>
            <p role="alert" aria-live="polite" className="rounded-[12px] bg-[#FDECEA] px-4 py-3 text-[12px] text-[#922B21]">{submitError}</p>
          </StaggerItem>
        ) : null}

        <StaggerItem>
          <Button type="submit" className="h-12 w-full bg-[#1E5E27] text-[14px] hover:bg-[#174B1F]" disabled={!isValid || isSubmitting}>
            {isSubmitting ? t("auth.signingIn") : <>{t("auth.signInCta")} <ArrowRight className="h-4 w-4" /></>}
          </Button>
        </StaggerItem>
      </Stagger>

      <div className="my-7 flex items-center gap-3">
        <span className="h-px flex-1 bg-[#E5E7EB]" />
        <span className="text-[11px] text-[#9CA3AF]">OR</span>
        <span className="h-px flex-1 bg-[#E5E7EB]" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => startOAuth("google")} className="inline-flex h-12 items-center justify-center gap-3 rounded-[9px] border border-[#E5E7EB] bg-white text-[13px] font-semibold text-[#374151] hover:bg-[#F9FAFB]">
          <Globe2 className="h-4 w-4 text-[#1E5E27]" /> Google
        </button>
        <button type="button" onClick={() => startOAuth("apple")} className="inline-flex h-12 items-center justify-center gap-3 rounded-[9px] border border-[#E5E7EB] bg-white text-[13px] font-semibold text-[#374151] hover:bg-[#F9FAFB]">
          <Apple className="h-4 w-4 text-black" /> Apple
        </button>
      </div>
      <p className="mt-9 text-center text-[11px] leading-5 text-[#6B7280]">
        By signing in, you agree to our <Link href="/terms" className="underline hover:text-[#1E5E27]">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-[#1E5E27]">Privacy Policy</Link>.
      </p>
    </div>
  );
}
