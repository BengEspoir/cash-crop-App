"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { PhoneInput } from "../../../../components/auth/PhoneInput";
import { PasswordInput } from "../../../../components/auth/PasswordInput";
import { RoleSwitcher } from "../../../../components/auth/RoleSwitcher";
import { StepIndicator } from "../../../../components/auth/StepIndicator";
import { registerBuyerSchemas, registerBuyerUnifiedSchema } from "../../../../lib/validators";
import { getInternationalCountries, getCountryByCode } from "../../../../lib/countries";
import { getAuthNextRoute } from "../../../../lib/authRoutes";
import useAuthStore from "../../../../store/authStore";
import toast from "react-hot-toast";
import { ArrowRight, Apple, Globe2 } from "lucide-react";
import { startOAuth } from "../../../../lib/startOAuth";

// Country Select Component for International Buyers
function CountrySelect({ value, onChange, error }) {
  const countries = getInternationalCountries();
  
  return (
    <div>
      <Label>Country *</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-[8px] border border-[#D1D5DB] bg-white px-3 text-[14px] text-[#111827] outline-none focus:border-[#1A6B3C]"
      >
        <option value="">Select a country</option>
        {countries.map((country) => (
          <option key={country.code} value={country.name}>
            {country.flag} {country.name} ({country.dialCode})
          </option>
        ))}
      </select>
      {error ? <p className="mt-2 text-[12px] text-[#922B21]">{error}</p> : null}
    </div>
  );
}

const steps = ["Buyer Profile"];

export default function RegisterBuyerPage() {
  const router = useRouter();
  const { registerBuyer } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitState, setSubmitState] = useState({ error: "" });
  const [selectedCountryCode, setSelectedCountryCode] = useState("CM");
  
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
    resolver: zodResolver(registerBuyerUnifiedSchema),
    mode: "onChange",
    defaultValues: {
      buyerType: "local",
      companyName: "",
      contactName: "",
      country: "Cameroon",
      countryCode: "CM",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreedToPolicy: false,
    },
  });

  const buyerType = watch("buyerType");
  const selectedCountry = watch("country");

  // Handle buyer type change
  useEffect(() => {
    if (buyerType === "local") {
      setValue("country", "Cameroon");
      setValue("countryCode", "CM");
      setSelectedCountryCode("CM");
    } else {
      // Clear country for international buyers
      setValue("country", "");
      setValue("countryCode", "");
      setSelectedCountryCode("");
      setValue("phone", "");
    }
  }, [buyerType, setValue]);

  // Handle country selection change
  const handleCountryChange = (countryName) => {
    const country = getInternationalCountries().find(c => c.name === countryName);
    if (country) {
      setValue("country", country.name);
      setValue("countryCode", country.code);
      setSelectedCountryCode(country.code);
      setValue("phone", ""); // Clear phone when country changes
    }
  };

  const handlePhoneCountryChange = (countryCode) => {
    const country = getCountryByCode(countryCode);
    if (country) {
      setSelectedCountryCode(countryCode);
      if (buyerType === "international") {
        setValue("country", country.name);
        setValue("countryCode", countryCode);
      }
    }
  };

  const validateStep = async (stepNum) => {
    const step0Fields = ["buyerType", "companyName", "contactName", "country", "countryCode", "phone", "email", "password", "confirmPassword", "agreedToPolicy"];
    const fieldsToCheck = [step0Fields][stepNum] || [];
    const stepSchema = registerBuyerSchemas[stepNum];

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
    
    // Validate current step before proceeding
    const isStepValid = await validateStep(currentStep);
    if (!isStepValid) {
      return; // Validation failed, stay on current step
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep((step) => step + 1);
      return;
    }

    const result = await registerBuyer(values);
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
    <div className="mx-auto w-full max-w-[560px]">
      <Card className="rounded-[20px] p-6 sm:p-8">
        <div className="space-y-2">
          <p className="section-eyebrow">Buyer onboarding</p>
          <h1 className="font-display text-[24px] leading-[1.12] text-ink-900">Create your buyer account</h1>
          <p className="text-[14px] leading-6 text-ink-700">
            A premium sourcing profile built for verified supply, protected settlement rails, and export-ready workflows.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <RoleSwitcher
            className="w-full justify-start sm:w-auto"
            value={watch("buyerType")}
            onChange={(nextValue) => setValue("buyerType", nextValue, { shouldValidate: true })}
            options={[
              { label: "Local Buyer", value: "local" },
              { label: "International Buyer", value: "international" },
            ]}
          />
          <StepIndicator steps={steps} currentStep={currentStep} />
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit(submitStep)}>
        {currentStep === 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Company or Buyer Name *</Label>
                <Input placeholder="Agri Export Ltd." autoComplete="organization" {...register("companyName")} />
                {errors.companyName ? <p className="mt-2 text-[12px] text-[#922B21]">{errors.companyName.message}</p> : null}
              </div>
              <div>
                <Label>Contact Name *</Label>
                <Input placeholder="Amina Kofi" autoComplete="name" {...register("contactName")} />
                {errors.contactName ? <p className="mt-2 text-[12px] text-[#922B21]">{errors.contactName.message}</p> : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {buyerType === "local" ? (
                <div>
                  <Label>Country *</Label>
                  <Input 
                    value="Cameroon" 
                    disabled 
                    className="bg-[#F9FAFB] text-[#6B7280]"
                  />
                  <input type="hidden" {...register("country")} value="Cameroon" />
                  <input type="hidden" {...register("countryCode")} value="CM" />
                </div>
              ) : (
                <CountrySelect
                  value={selectedCountry}
                  onChange={handleCountryChange}
                  error={errors.country?.message}
                />
              )}
              <PhoneInput
                label="Phone Number *"
                value={watch("phone")}
                onChange={(nextPhone) => setValue("phone", nextPhone, { shouldValidate: true })}
                error={errors.phone?.message}
                countryCode={selectedCountryCode}
                onCountryChange={handlePhoneCountryChange}
                showCountrySelector={buyerType === "international"}
                disabled={buyerType === "international" && !selectedCountry}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Email Address *</Label>
                <Input placeholder="example@yahoo.com" autoComplete="email" {...register("email")} />
                {errors.email ? <p className="mt-2 text-[12px] text-[#922B21]">{errors.email.message}</p> : null}
              </div>
              <div className="rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4 text-[13px] leading-6 text-[#374151]">
                Buyer country is stored separately from destination market so trade and logistics records stay accurate.
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <PasswordInput label="Password *" placeholder="Minimum 8 characters" autoComplete="new-password" error={errors.password?.message} {...register("password")} />
              <PasswordInput label="Confirm Password *" placeholder="Repeat password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
            </div>

            <label className="flex items-start gap-3 rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4 text-[13px] text-[#374151]">
              <input type="checkbox" className="mt-1 h-4 w-4 rounded border-[#D1D5DB]" {...register("agreedToPolicy")} />
              <span>I agree to AgriculNet buyer terms, marketplace policies, and protected payment conditions.</span>
            </label>
            {errors.agreedToPolicy ? <p className="-mt-3 text-[12px] text-[#922B21]">{errors.agreedToPolicy.message}</p> : null}
          </>
        ) : null}

        {submitState.error ? <p className="rounded-[12px] bg-[#FDECEA] px-4 py-3 text-[12px] text-[#922B21]">{submitState.error}</p> : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          {currentStep > 0 ? (
            <Button type="button" variant="outline" onClick={() => setCurrentStep((step) => step - 1)}>
              Back
            </Button>
          ) : <span />}
          <Button type="submit" disabled={!isValid || isSubmitting} variant="cta">
            {isSubmitting ? "Processing..." : currentStep === steps.length - 1 ? "Create Buyer Account" : "Continue"}
          </Button>
        </div>

        <div className="pt-2">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-ink-200" />
            <p className="text-[12px] font-semibold text-ink-500">Or continue with</p>
            <div className="h-px flex-1 bg-ink-200" />
          </div>

          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={() => startOAuth("google")}
              className="group inline-flex h-11 w-full items-center justify-center gap-3 rounded-[12px] border border-ink-200 bg-white px-4 text-[13px] font-semibold text-ink-800 shadow-soft transition-all duration-200 hover:-translate-y-[1px] hover:border-green-200 hover:shadow-lift"
            >
              <Globe2 className="h-4 w-4 text-green-800" />
              Continue with Google
              <ArrowRight className="h-4 w-4 opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100" />
            </button>
            <button
              type="button"
              onClick={() => startOAuth("apple")}
              className="group inline-flex h-11 w-full items-center justify-center gap-3 rounded-[12px] border border-ink-200 bg-white px-4 text-[13px] font-semibold text-ink-800 shadow-soft transition-all duration-200 hover:-translate-y-[1px] hover:border-green-200 hover:shadow-lift"
            >
              <Apple className="h-4 w-4" />
              Continue with Apple
              <ArrowRight className="h-4 w-4 opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100" />
            </button>
            <button
              type="button"
              onClick={() => startOAuth("facebook")}
              className="group inline-flex h-11 w-full items-center justify-center gap-3 rounded-[12px] border border-ink-200 bg-white px-4 text-[13px] font-semibold text-ink-800 shadow-soft transition-all duration-200 hover:-translate-y-[1px] hover:border-green-200 hover:shadow-lift"
            >
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                f
              </span>
              Continue with Facebook
              <ArrowRight className="h-4 w-4 opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100" />
            </button>
          </div>
        </div>

        <p className="pt-1 text-[12.5px] text-ink-500">
          Already have an account?{" "}
          <Link className="font-semibold text-green-800 hover:text-green-700" href="/sign-in">
            Sign in
          </Link>
        </p>
      </form>
      </Card>
    </div>
  );
}
