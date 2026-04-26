"use client";

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
import { registerBuyerUnifiedSchema } from "../../../../lib/validators";
import { getInternationalCountries, getLocalCountry, getCountryByCode } from "../../../../lib/countries";
import useAuthStore from "../../../../store/authStore";

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

const steps = ["Buyer Profile", "Sourcing Preferences"];

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
    trigger,
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
      buyingFocus: "",
      monthlyVolume: "",
      destination: "",
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
    // Define which fields belong to each step
    const step0Fields = ["companyName", "contactName", "country", "phone", "email", "password", "confirmPassword"];
    const step1Fields = ["buyingFocus", "monthlyVolume", "destination", "agreedToPolicy"];

    const fieldsToCheck = [step0Fields, step1Fields][stepNum];

    // Trigger validation only for current step fields
    const validationResults = await Promise.all(
      fieldsToCheck.map((field) => trigger(field))
    );

    return validationResults.every((result) => result === true);
  };

  const submitStep = async (values) => {
    setSubmitState({ error: "" });
    
    // Validate current step before proceeding
    const isStepValid = await validateStep(currentStep, values);
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

    router.push("/verify-phone");
  };

  return (
    <Card className="rounded-[20px] p-6 sm:p-8">
      <div className="space-y-2">
        <p className="section-eyebrow">Buyer Registration</p>
        <h1 className="font-display text-[22px] leading-[1.15] text-[#111827]">Create your buyer account</h1>
        <p className="text-[14px] leading-6 text-[#374151]">Set up a local or international sourcing profile with the same protected onboarding flow.</p>
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
                <Input placeholder="Agri Export Ltd." {...register("companyName")} />
                {errors.companyName ? <p className="mt-2 text-[12px] text-[#922B21]">{errors.companyName.message}</p> : null}
              </div>
              <div>
                <Label>Contact Name *</Label>
                <Input placeholder="Amina Kofi" {...register("contactName")} />
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
                <Input placeholder="buyer@example.com" {...register("email")} />
                {errors.email ? <p className="mt-2 text-[12px] text-[#922B21]">{errors.email.message}</p> : null}
              </div>
              <div className="rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4 text-[13px] leading-6 text-[#374151]">
                Buyer country is stored separately from destination market so trade and logistics records stay accurate.
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <PasswordInput label="Password *" placeholder="Minimum 8 characters" error={errors.password?.message} {...register("password")} />
              <PasswordInput label="Confirm Password *" placeholder="Repeat password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
            </div>
          </>
        ) : null}

        {currentStep === 1 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Buying Focus *</Label>
              <Input placeholder="Cocoa, coffee, maize" {...register("buyingFocus")} />
              {errors.buyingFocus ? <p className="mt-2 text-[12px] text-[#922B21]">{errors.buyingFocus.message}</p> : null}
            </div>
            <div>
              <Label>Monthly Volume *</Label>
              <Input placeholder="e.g. 12 tonnes" {...register("monthlyVolume")} />
              {errors.monthlyVolume ? <p className="mt-2 text-[12px] text-[#922B21]">{errors.monthlyVolume.message}</p> : null}
            </div>
            <div className="sm:col-span-2">
              <Label>Destination Market *</Label>
              <Input placeholder="Douala, Lagos, Rotterdam" {...register("destination")} />
              {errors.destination ? <p className="mt-2 text-[12px] text-[#922B21]">{errors.destination.message}</p> : null}
            </div>
            <label className="sm:col-span-2 flex items-start gap-3 rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4 text-[13px] text-[#374151]">
              <input type="checkbox" className="mt-1 h-4 w-4 rounded border-[#D1D5DB]" {...register("agreedToPolicy")} />
              <span>I agree to AgriculNet buyer terms, sourcing policies, and protected payment conditions.</span>
            </label>
            {errors.agreedToPolicy ? <p className="-mt-3 sm:col-span-2 text-[12px] text-[#922B21]">{errors.agreedToPolicy.message}</p> : null}
          </div>
        ) : null}

        {submitState.error ? <p className="rounded-[12px] bg-[#FDECEA] px-4 py-3 text-[12px] text-[#922B21]">{submitState.error}</p> : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          {currentStep > 0 ? (
            <Button type="button" variant="outline" onClick={() => setCurrentStep((step) => step - 1)}>
              Back
            </Button>
          ) : <span />}
          <Button type="submit" disabled={!isValid || isSubmitting}>
            {isSubmitting ? "Processing..." : currentStep === steps.length - 1 ? "Create Buyer Account" : "Continue"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
