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
import useAuthStore from "../../../store/authStore";

const getDashboardRoute = (user, nextStep) => {
  if (nextStep === "pending_review" || user?.status === "pending_review") {
    return "/pending";
  }

  switch (user?.role) {
    case "farmer":
      return "/farmer/dashboard";
    case "local_buyer":
    case "international_buyer":
      return "/buyer/dashboard";
    default:
      return "/";
  }
};

export default function SignInPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [mode, setMode] = useState("phone");
  const [submitError, setSubmitError] = useState("");
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

    const identifier = values.mode === "phone" ? values.phone : values.email;
    const result = await login(identifier, values.password);

    if (!result.success) {
      if (result.errorCode === "PHONE_NOT_VERIFIED") {
        router.push("/verify-phone");
        return;
      }

      setSubmitError(result.error);
      return;
    }

    router.push(getDashboardRoute(result.data.user, result.data.nextStep));
  };

  return (
    <Card elevated className="rounded-[22px] p-6 sm:p-8">
      <Reveal inView={false} className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-eyebrow">Welcome Back</p>
          <h1 className="mt-2 font-display text-[24px] leading-[1.15] text-ink-800">Sign in to AgriculNet</h1>
          <p className="mt-3 text-[14px] leading-6 text-ink-700">Use phone or email to continue trading, sourcing, and tracking orders.</p>
        </div>
        <p className="text-[13px] text-ink-700">
          New here?{" "}
          <Link href="/register" className="font-semibold text-green-800 hover:text-green-700">
            Register
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
            { label: "Phone Number", value: "phone" },
            { label: "Email Address", value: "email" },
          ]}
        />
        </StaggerItem>

        <StaggerItem>
        {mode === "phone" ? (
          <PhoneInput
            label="Phone Number"
            value={watch("phone")}
            onChange={(nextPhone) => setValue("phone", nextPhone, { shouldValidate: true })}
            error={errors.phone?.message}
          />
        ) : (
          <div>
            <Label>Email Address</Label>
            <Input placeholder="name@example.com" {...register("email")} />
            {errors.email ? <p className="mt-2 text-[12px] text-[#922B21]">{errors.email.message}</p> : null}
          </div>
        )}
        </StaggerItem>

        <StaggerItem>
          <PasswordInput label="Password" placeholder="Enter your password" error={errors.password?.message} {...register("password")} />
        </StaggerItem>

        <StaggerItem className="flex flex-wrap items-center justify-between gap-3 text-[13px]">
          <Link href="/forgot-password" className="font-semibold text-green-800 hover:text-green-700">
            Forgot your password?
          </Link>
          <span className="text-ink-500">Phone verification resumes automatically if needed.</span>
        </StaggerItem>

        {submitError ? (
          <StaggerItem>
            <p className="rounded-[12px] bg-[#FDECEA] px-4 py-3 text-[12px] text-[#922B21]">{submitError}</p>
          </StaggerItem>
        ) : null}

        <StaggerItem>
          <Button type="submit" className="h-11 w-full text-[14px]" disabled={!isValid || isSubmitting}>
            {isSubmitting ? "Signing In..." : "Sign In"}
          </Button>
        </StaggerItem>
      </Stagger>
    </Card>
  );
}
