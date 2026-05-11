"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input, inputClasses } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { PhoneInput } from "../../../../components/auth/PhoneInput";
import { PasswordInput } from "../../../../components/auth/PasswordInput";
import { PasswordStrength } from "../../../../components/auth/PasswordStrength";
import { RoleSwitcher } from "../../../../components/auth/RoleSwitcher";
import { StepIndicator } from "../../../../components/auth/StepIndicator";
import { registerFarmerSchemas, registerFarmerUnifiedSchema } from "../../../../lib/validators";
import { regions } from "../../../../constants/regions";
import { getAuthNextRoute } from "../../../../lib/authRoutes";
import useAuthStore from "../../../../store/authStore";
import toast from "react-hot-toast";

const steps = ["Personal", "Farm Details", "Payout Setup"];

export default function RegisterFarmerPage() {
  const router = useRouter();
  const { registerFarmer } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitState, setSubmitState] = useState({ error: "" });
  // Use unified schema to prevent data loss between steps
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    getValues,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(registerFarmerUnifiedSchema),
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
      acceptedTerms: false,
      primaryCrop: "",
      harvestVolume: "",
      cooperative: "",
      exportReady: false,
      inspectionPreference: "",
      payoutMethod: "",
      accountName: "",
      payoutPhone: "",
      notificationOptIn: true,
    },
  });

  const password = watch("password");

  // Step-specific field validators
  const validateStep = async (stepNum) => {
    const step1Fields = ["firstName", "lastName", "phone", "region", "city", "acceptedTerms", "password", "confirmPassword"];
    const step2Fields = ["primaryCrop", "harvestVolume", "cooperative", "inspectionPreference"];
    const step3Fields = ["payoutMethod", "accountName", "payoutPhone"];
    const fieldsToCheck = [step1Fields, step2Fields, step3Fields][stepNum] || [];
    const stepSchema = registerFarmerSchemas[stepNum];

    clearErrors(fieldsToCheck);

    if (!stepSchema) {
      return true;
    }

    const result = stepSchema.safeParse(getValues());
    if (result.success) {
      return true;
    }

    result.error.issues.forEach((issue) => {
      const field = issue.path[0];
      if (typeof field === "string") {
        setError(field, { type: "manual", message: issue.message });
      }
    });

    return false;
  };

  const submitStep = async (values) => {
    setSubmitState({ error: "" });

    if (currentStep < steps.length - 1) {
      // Validate current step before moving to next
      const isValid = await validateStep(currentStep);
      if (!isValid) {
        return; // Form validation errors will be shown
      }
      setCurrentStep((step) => step + 1);
      return;
    }

    for (let stepNum = 0; stepNum < steps.length; stepNum += 1) {
      const stepOk = await validateStep(stepNum);
      if (!stepOk) {
        setCurrentStep(stepNum);
        return;
      }
    }

    const result = await registerFarmer(values);
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
      toast.success("Account created. Verify your email to enter your dashboard.");
    }
    router.push(getAuthNextRoute(result.data.nextStep, result.data.user));
  };

  return (
    <Card className="rounded-[20px] p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="section-eyebrow">Farmer Registration</p>
          <h1 className="mt-2 font-display text-[22px] leading-[1.15] text-[#111827]">Create your farmer account</h1>
        </div>
        <p className="text-[13px] text-[#374151]">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-[#1A6B3C] hover:text-[#2E8B57]">Sign In</Link>
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <RoleSwitcher
          value="farmer"
          onChange={(nextValue) => {
            if (nextValue === "buyer") {
              router.push("/register/buyer");
            }
          }}
          options={[{ label: "Farmer", value: "farmer" }, { label: "Buyer", value: "buyer" }]}
        />
        <StepIndicator steps={steps} currentStep={currentStep} />
      </div>

      <form key={currentStep} className="mt-6 space-y-5" onSubmit={handleSubmit(submitStep)}>
        {currentStep === 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>First Name *</Label>
                <Input placeholder="e.g. Jean" autoComplete="given-name" {...register("firstName")} />
                {errors.firstName ? <p className="mt-2 text-[12px] text-[#922B21]">{errors.firstName.message}</p> : null}
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input placeholder="e.g. Ngum" autoComplete="family-name" {...register("lastName")} />
                {errors.lastName ? <p className="mt-2 text-[12px] text-[#922B21]">{errors.lastName.message}</p> : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <PhoneInput
                label="Phone Number *"
                value={watch("phone")}
                onChange={(nextPhone) => setValue("phone", nextPhone, { shouldValidate: true })}
                helper="Used for trade alerts and payout setup"
                error={errors.phone?.message}
              />
              <div>
                <Label>Email Address *</Label>
                <Input placeholder="example@gmail.com" autoComplete="email" {...register("email")} />
                <p className="mt-2 text-[12px] text-[#6B7280]">Required for account verification</p>
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
                <Input placeholder="e.g. Kumba" {...register("city")} />
                {errors.city ? <p className="mt-2 text-[12px] text-[#922B21]">{errors.city.message}</p> : null}
              </div>
            </div>

            <label className="flex items-start gap-3 rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4 text-[13px] text-[#374151]">
              <input type="checkbox" className="mt-1 h-4 w-4 rounded border-[#D1D5DB]" {...register("acceptedTerms")} />
              <span>I agree to AgriculNet&apos;s Terms of Use and Privacy Policy.</span>
            </label>
            {errors.acceptedTerms ? <p className="-mt-3 text-[12px] text-[#922B21]">{errors.acceptedTerms.message}</p> : null}
          </>
        ) : null}

        {currentStep === 1 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Primary Crop *</Label>
              <Input placeholder="Cocoa Beans" {...register("primaryCrop")} />
              {errors.primaryCrop ? <p className="mt-2 text-[12px] text-[#922B21]">{errors.primaryCrop.message}</p> : null}
            </div>
            <div>
              <Label>Estimated Harvest Volume *</Label>
              <Input placeholder="e.g. 2,000 kg" {...register("harvestVolume")} />
              {errors.harvestVolume ? <p className="mt-2 text-[12px] text-[#922B21]">{errors.harvestVolume.message}</p> : null}
            </div>
            <div>
              <Label>Farm or Cooperative Name *</Label>
              <Input placeholder="e.g. Kumba Growers Union" {...register("cooperative")} />
              {errors.cooperative ? <p className="mt-2 text-[12px] text-[#922B21]">{errors.cooperative.message}</p> : null}
            </div>
            <div>
              <Label>Inspection Preference *</Label>
              <Input placeholder="AgriculNet coordinated" {...register("inspectionPreference")} />
              {errors.inspectionPreference ? <p className="mt-2 text-[12px] text-[#922B21]">{errors.inspectionPreference.message}</p> : null}
            </div>
            <label className="sm:col-span-2 flex items-start gap-3 rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4 text-[13px] text-[#374151]">
              <input type="checkbox" className="mt-1 h-4 w-4 rounded border-[#D1D5DB]" {...register("exportReady")} />
              <span>My produce is prepared for export checks and buyer documentation.</span>
            </label>
          </div>
        ) : null}

        {currentStep === 2 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Payout Method *</Label>
              <Input placeholder="MTN MoMo" {...register("payoutMethod")} />
              {errors.payoutMethod ? <p className="mt-2 text-[12px] text-[#922B21]">{errors.payoutMethod.message}</p> : null}
            </div>
            <div>
              <Label>Account Name *</Label>
              <Input placeholder="Jean Ngum" {...register("accountName")} />
              {errors.accountName ? <p className="mt-2 text-[12px] text-[#922B21]">{errors.accountName.message}</p> : null}
            </div>
            <PhoneInput
              label="Payout Phone *"
              value={watch("payoutPhone")}
              onChange={(nextPhone) => setValue("payoutPhone", nextPhone, { shouldValidate: true })}
              error={errors.payoutPhone?.message}
            />
            <label className="flex items-start gap-3 rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4 text-[13px] text-[#374151]">
              <input type="checkbox" className="mt-1 h-4 w-4 rounded border-[#D1D5DB]" {...register("notificationOptIn")} />
              <span>Send SMS and email updates when buyers request a quote or place an order.</span>
            </label>
          </div>
        ) : null}

        {submitState.error ? <p className="rounded-[12px] bg-[#FDECEA] px-4 py-3 text-[12px] text-[#922B21]">{submitState.error}</p> : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3 text-[13px]">
            {currentStep > 0 ? (
              <Button type="button" variant="outline" onClick={() => setCurrentStep((step) => step - 1)}>
                Back
              </Button>
            ) : null}
            <span className="font-medium text-[#6B7280]">Email verification starts after account creation.</span>
          </div>
          <Button type="submit" disabled={!isValid || isSubmitting}>
            {isSubmitting ? "Processing..." : currentStep === steps.length - 1 ? "Create Farmer Account" : "Continue"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
