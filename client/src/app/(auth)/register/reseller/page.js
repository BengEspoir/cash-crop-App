"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input, inputClasses } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { PhoneInput } from "../../../../components/auth/PhoneInput";
import { PasswordInput } from "../../../../components/auth/PasswordInput";
import { PasswordStrength } from "../../../../components/auth/PasswordStrength";
import { regions } from "../../../../constants/regions";
import { getAuthNextRoute } from "../../../../lib/authRoutes";
import useAuthStore from "../../../../store/authStore";
import toast from "react-hot-toast";

const cameroonPhone = /^6[\d\s]{8,11}$/;
const passwordSchema = z.string()
  .min(8, "At least 8 characters")
  .regex(/[a-z]/, "One lowercase letter")
  .regex(/[A-Z]/, "One uppercase letter")
  .regex(/\d/, "One number");

const resellerSchema = z.object({
  firstName: z.string().min(2, "First name is required."),
  lastName: z.string().min(2, "Last name is required."),
  phone: z.string().regex(cameroonPhone, "Enter a valid Cameroon phone number starting with 6."),
  email: z.string().email("Enter a valid email address."),
  password: passwordSchema,
  confirmPassword: z.string().min(8, "Confirm your password."),
  region: z.string().min(2, "Select your region."),
  city: z.string().min(2, "Enter your city or town."),
  businessName: z.string().min(2, "Enter your business name."),
  primaryCrop: z.string().optional(),
  acceptedTerms: z.boolean().refine(Boolean, "You must accept the terms."),
}).refine((value) => value.password === value.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match.",
});

export default function RegisterResellerPage() {
  const router = useRouter();
  const { registerReseller } = useAuthStore();
  const [submitState, setSubmitState] = useState({ error: "" });
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(resellerSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
      region: "",
      city: "",
      businessName: "",
      primaryCrop: "",
      acceptedTerms: false,
    },
  });

  const password = watch("password");

  const submit = async (values) => {
    setSubmitState({ error: "" });
    const result = await registerReseller(values);
    if (!result.success) {
      const detailMessage = result.details?.[0]?.message;
      setSubmitState({ error: detailMessage || result.error });
      return;
    }

    if (result.data.emailDelivery?.status === "failed") {
      toast.error(result.data.emailDelivery.message || "Account created, but verification email could not be sent.", {
        duration: 8000,
      });
    } else {
      toast.success("Reseller account created. Verify your email to continue.");
    }
    router.push(getAuthNextRoute(result.data.nextStep, result.data.user));
  };

  return (
    <Card className="rounded-[20px] p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="section-eyebrow">Reseller Registration</p>
          <h1 className="mt-2 font-display text-[22px] leading-[1.15] text-[#111827]">Create your reseller account</h1>
          <p className="mt-2 text-[14px] leading-6 text-[#374151]">Start selling aggregated crop supply. Payout and ID verification tasks appear in your seller dashboard.</p>
        </div>
        <p className="text-[13px] text-[#374151]">
          Sell as a farmer?{" "}
          <Link href="/sell/onboarding" className="font-semibold text-[#1A6B3C] hover:text-[#2E8B57]">Use farmer onboarding</Link>
        </p>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit(submit)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>First Name *</Label>
            <Input placeholder="e.g. Nadine" autoComplete="given-name" {...register("firstName")} />
            {errors.firstName ? <p className="mt-2 text-[12px] text-[#922B21]">{errors.firstName.message}</p> : null}
          </div>
          <div>
            <Label>Last Name *</Label>
            <Input placeholder="e.g. Besong" autoComplete="family-name" {...register("lastName")} />
            {errors.lastName ? <p className="mt-2 text-[12px] text-[#922B21]">{errors.lastName.message}</p> : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <PhoneInput
            label="Phone Number *"
            value={watch("phone")}
            onChange={(nextPhone) => setValue("phone", nextPhone, { shouldValidate: true })}
            error={errors.phone?.message}
          />
          <div>
            <Label>Email Address *</Label>
            <Input placeholder="reseller@example.com" autoComplete="email" {...register("email")} />
            {errors.email ? <p className="mt-2 text-[12px] text-[#922B21]">{errors.email.message}</p> : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <PasswordInput label="Password *" placeholder="Minimum 8 characters" autoComplete="new-password" error={errors.password?.message} {...register("password")} />
          <PasswordInput label="Confirm Password *" placeholder="Repeat password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
        </div>

        <PasswordStrength password={password || ""} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Region *</Label>
            <select className={inputClasses} {...register("region")}>
              <option value="">Select a region</option>
              {regions.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
            {errors.region ? <p className="mt-2 text-[12px] text-[#922B21]">{errors.region.message}</p> : null}
          </div>
          <div>
            <Label>City / Town *</Label>
            <Input placeholder="e.g. Douala" {...register("city")} />
            {errors.city ? <p className="mt-2 text-[12px] text-[#922B21]">{errors.city.message}</p> : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Business Name *</Label>
            <Input placeholder="e.g. Buea Agro Sourcing" {...register("businessName")} />
            {errors.businessName ? <p className="mt-2 text-[12px] text-[#922B21]">{errors.businessName.message}</p> : null}
          </div>
          <div>
            <Label>Main Crop</Label>
            <Input placeholder="Cocoa Beans" {...register("primaryCrop")} />
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4 text-[13px] text-[#374151]">
          <input type="checkbox" className="mt-1 h-4 w-4 rounded border-[#D1D5DB]" {...register("acceptedTerms")} />
          <span>I agree to AgriculNet&apos;s Terms of Use, seller policies, and verification requirements.</span>
        </label>
        {errors.acceptedTerms ? <p className="-mt-3 text-[12px] text-[#922B21]">{errors.acceptedTerms.message}</p> : null}

        {submitState.error ? <p className="rounded-[12px] bg-[#FDECEA] px-4 py-3 text-[12px] text-[#922B21]">{submitState.error}</p> : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[13px] font-medium text-[#6B7280]">Farm details are not required for reseller onboarding.</span>
          <Button type="submit" disabled={!isValid || isSubmitting}>
            {isSubmitting ? "Processing..." : "Create Reseller Account"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
