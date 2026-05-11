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
import { PasswordInput } from "../../../components/auth/PasswordInput";
import { RoleSwitcher } from "../../../components/auth/RoleSwitcher";
import { Reveal, Stagger, StaggerItem } from "../../../components/motion/Reveal";
import { signInSchema } from "../../../lib/validators";
import { formatPhoneInternational } from "../../../lib/countries";
import { getAuthNextRoute } from "../../../lib/authRoutes";
import useAuthStore from "../../../store/authStore";
import { useI18n } from "../../../i18n/I18nProvider";

export default function SignInPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { login } = useAuthStore();
  const [mode, setMode] = useState("phone");
  const [submitError, setSubmitError] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("CM");
  const {
    register,
    handleSubmit,
    setValue,
    watch,
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

  const onSubmit = async (values) => {
    setSubmitError("");

    let identifier;
    if (values.mode === "phone") {
      // Format phone with country code for international numbers
      if (selectedCountry === "CM") {
        identifier = values.phone; // Cameroon uses local format
      } else {
        identifier = formatPhoneInternational(values.phone, selectedCountry);
      }
    } else {
      identifier = values.email;
    }
    
    const result = await login(identifier, values.password);

    if (!result.success) {
      setSubmitError(result.error);
      return;
    }

    router.push(getAuthNextRoute(result.data.nextStep, result.data.user));
  };

  return (
    <Card elevated className="rounded-[22px] p-6 sm:p-8">
      <Reveal inView={false} className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-eyebrow">{t("auth.welcomeBack")}</p>
          <h1 className="mt-2 font-display text-[24px] leading-[1.15] text-ink-800">{t("auth.signInTitle")}</h1>
          <p className="mt-3 text-[14px] leading-6 text-ink-700">{t("auth.signInSubtitle")}</p>
        </div>
        <p className="text-[13px] text-ink-700">
          {t("auth.newHere")}{" "}
          <Link href="/register" className="font-semibold text-green-800 hover:text-green-700">
            {t("auth.register")}
          </Link>
        </p>
      </Reveal>

      <Stagger as="form" className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)} delay={0.08}>
        <StaggerItem>
        <RoleSwitcher
          value={mode}
          onChange={(nextMode) => {
            setMode(nextMode);
            setValue("mode", nextMode, { shouldValidate: true });
          }}
          options={[
            { label: t("auth.phoneTab"), value: "phone" },
            { label: t("auth.emailTab"), value: "email" },
          ]}
        />
        </StaggerItem>

        <StaggerItem>
        {mode === "phone" ? (
          <PhoneInput
            label={t("auth.phoneLabel")}
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
            <Label>{t("auth.emailLabel")}</Label>
            <Input placeholder={t("auth.emailPlaceholder")} autoComplete="email" {...register("email")} />
            {errors.email ? <p className="mt-2 text-[12px] text-[#922B21]">{errors.email.message}</p> : null}
          </div>
        )}
        </StaggerItem>

        <StaggerItem>
          <PasswordInput label={t("auth.passwordLabel")} placeholder={t("auth.passwordPlaceholder")} autoComplete="current-password" error={errors.password?.message} {...register("password")} />
        </StaggerItem>

        <StaggerItem className="flex flex-wrap items-center justify-between gap-3 text-[13px]">
          <Link href="/forgot-password" className="font-semibold text-green-800 hover:text-green-700">
            {t("auth.forgotPassword")}
          </Link>
          <span className="text-ink-500">{t("auth.phoneVerifyNote")}</span>
        </StaggerItem>

        {submitError ? (
          <StaggerItem>
            <p className="rounded-[12px] bg-[#FDECEA] px-4 py-3 text-[12px] text-[#922B21]">{submitError}</p>
          </StaggerItem>
        ) : null}

        <StaggerItem>
          <Button type="submit" className="h-11 w-full text-[14px]" disabled={!isValid || isSubmitting}>
            {isSubmitting ? t("auth.signingIn") : t("auth.signInCta")}
          </Button>
        </StaggerItem>
      </Stagger>
    </Card>
  );
}
