"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Apple, ArrowLeft, ArrowRight, Globe2, Home } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { BrandLogo } from "../../../../components/common/BrandLogo";
import { PhoneInput } from "../../../../components/auth/PhoneInput";
import { PasswordInput } from "../../../../components/auth/PasswordInput";
import { registerBuyerUnifiedSchema } from "../../../../lib/validators";
import { getInternationalCountries, getCountryByCode } from "../../../../lib/countries";
import { getAuthNextRoute } from "../../../../lib/authRoutes";
import { startOAuth } from "../../../../lib/startOAuth";
import useAuthStore from "../../../../store/authStore";

const fieldClassName = "h-12 border-transparent bg-[#F6F7F6] focus:border-[#1E5E27] focus:ring-2 focus:ring-[#1E5E27]/10";

function CountrySelect({ value, onChange, error }) {
  const countries = getInternationalCountries();

  return (
    <div>
      <Label>Country *</Label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-[10px] border border-transparent bg-[#F6F7F6] px-3 text-[14px] text-[#111827] outline-none transition focus:border-[#1E5E27] focus:ring-2 focus:ring-[#1E5E27]/10"
      >
        <option value="">Select Country</option>
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

export default function RegisterBuyerPage() {
  const router = useRouter();
  const { registerBuyer } = useAuthStore();
  const [stage, setStage] = useState("selection");
  const [submitError, setSubmitError] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("CM");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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

  useEffect(() => {
    if (buyerType === "local") {
      setValue("country", "Cameroon");
      setValue("countryCode", "CM");
      setSelectedCountryCode("CM");
      return;
    }

    setValue("country", "");
    setValue("countryCode", "");
    setSelectedCountryCode("");
    setValue("phone", "");
  }, [buyerType, setValue]);

  const selectBuyerType = (nextType) => {
    setValue("buyerType", nextType, { shouldValidate: true });
  };

  const handleCountryChange = (countryName) => {
    const country = getInternationalCountries().find((item) => item.name === countryName);
    if (!country) return;
    setValue("country", country.name, { shouldValidate: true });
    setValue("countryCode", country.code, { shouldValidate: true });
    setSelectedCountryCode(country.code);
    setValue("phone", "", { shouldValidate: true });
  };

  const submit = async (values) => {
    setSubmitError("");
    const result = await registerBuyer(values);
    if (!result.success) {
      setSubmitError(result.details?.[0]?.message || result.error);
      return;
    }

    if (result.data.emailDelivery?.status === "failed") {
      toast.error(result.data.emailDelivery.message || "Account created, but verification email could not be sent.", {
        duration: 8000,
      });
    } else {
      toast.success("Account created. Verify your email to continue.");
    }
    router.push(getAuthNextRoute(result.data.nextStep, result.data.user));
  };

  if (stage === "selection") {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between gap-4">
          <BrandLogo className="h-9 w-[118px]" priority />
          <p className="text-[11px] text-[#9CA3AF]">
            Already a member?{" "}
            <Link href="/auth/login" className="font-semibold text-[#1E5E27] hover:underline">Sign in</Link>
          </p>
        </div>

        <div className="mt-16">
          <h1 className="font-display text-[35px] leading-[1.08] text-[#151515]">Create your buyer account</h1>
          <p className="mt-3 max-w-[48ch] text-[13px] leading-6 text-[#6B7280]">
            Choose how you source agricultural commodities on AgriculNet.
          </p>
        </div>

        <div className="mt-8 space-y-3" role="radiogroup" aria-label="Buyer type">
          {[
            {
              value: "local",
              title: "Local Buyer",
              description: "I source goods within the Cameroonian market.",
              icon: Home,
            },
            {
              value: "international",
              title: "International Buyer",
              description: "I source across borders and global markets.",
              icon: Globe2,
            },
          ].map(({ value, title, description, icon: Icon }) => {
            const selected = buyerType === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => selectBuyerType(value)}
                className={`flex w-full items-center gap-4 rounded-[12px] border px-4 py-4 text-left transition ${selected ? "border-[#1E5E27] bg-[#F1F8F2]" : "border-[#E5E7EB] bg-white hover:border-[#9BC7A2]"}`}
              >
                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-[10px] ${selected ? "bg-white text-[#1E5E27]" : "bg-[#F6F7F6] text-[#6B7280]"}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold text-[#1F2937]">{title}</span>
                  <span className="mt-1 block text-[11px] leading-5 text-[#6B7280]">{description}</span>
                </span>
                <span className={`h-4 w-4 rounded-full border-[4px] ${selected ? "border-[#1E5E27] bg-white" : "border-[#D1D5DB]"}`} />
              </button>
            );
          })}
        </div>

        <Button
          type="button"
          onClick={() => setStage("profile")}
          className="mt-5 h-12 w-full bg-[#1E5E27] hover:bg-[#174B1F]"
        >
          Continue to Profile <ArrowRight className="h-4 w-4" />
        </Button>

        {buyerType === "local" ? (
          <>
            <div className="my-7 flex items-center gap-3">
              <span className="h-px flex-1 bg-[#E5E7EB]" />
              <span className="text-[11px] text-[#9CA3AF]">OR SIGN UP WITH</span>
              <span className="h-px flex-1 bg-[#E5E7EB]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => startOAuth("google")} className="inline-flex h-11 items-center justify-center gap-2 rounded-[9px] border border-[#E5E7EB] text-[12px] font-semibold text-[#374151] hover:bg-[#F9FAFB]">
                <Globe2 className="h-4 w-4 text-[#1E5E27]" /> Google
              </button>
              <button type="button" onClick={() => startOAuth("apple")} className="inline-flex h-11 items-center justify-center gap-2 rounded-[9px] border border-[#E5E7EB] text-[12px] font-semibold text-[#374151] hover:bg-[#F9FAFB]">
                <Apple className="h-4 w-4 text-black" /> Apple
              </button>
            </div>
          </>
        ) : (
          <p className="mt-6 rounded-[10px] bg-[#F1F8F2] px-4 py-3 text-[12px] leading-5 text-[#1E5E27]">
            International registration uses email so country and phone details remain attached to the correct buyer type.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-4 text-[11px]">
        <button type="button" onClick={() => setStage("selection")} className="inline-flex items-center gap-1 text-[#6B7280] hover:text-[#1E5E27]">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to selection
        </button>
        <p className="text-[#9CA3AF]">
          Already a member?{" "}
          <Link href="/auth/login" className="font-semibold text-[#1E5E27] hover:underline">Sign in</Link>
        </p>
      </div>

      <div className="mt-12">
        <h1 className="font-display text-[35px] leading-[1.08] text-[#151515]">Complete Your Onboarding</h1>
        <p className="mt-3 text-[13px] leading-6 text-[#6B7280]">
          {buyerType === "local"
            ? "Create your local sourcing profile for the Cameroonian marketplace."
            : "Create your international sourcing profile with accurate country and contact details."}
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit(submit)}>
        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9CA3AF]">Company details</p>
          <div className="space-y-3">
            <div>
              <Label>Company or Buyer Name *</Label>
              <Input className={fieldClassName} placeholder="Company or Buyer Name" autoComplete="organization" {...register("companyName")} />
              {errors.companyName ? <p className="mt-2 text-[12px] text-[#922B21]">{errors.companyName.message}</p> : null}
            </div>
            <div>
              <Label>Contact Name *</Label>
              <Input className={fieldClassName} placeholder="Contact Name" autoComplete="name" {...register("contactName")} />
              {errors.contactName ? <p className="mt-2 text-[12px] text-[#922B21]">{errors.contactName.message}</p> : null}
            </div>
          </div>
        </div>

        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9CA3AF]">Contact information</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {buyerType === "local" ? (
              <div>
                <Label>Country *</Label>
                <Input className={fieldClassName} value="Cameroon" disabled />
                <input type="hidden" {...register("country")} value="Cameroon" />
                <input type="hidden" {...register("countryCode")} value="CM" />
              </div>
            ) : (
              <CountrySelect value={selectedCountry} onChange={handleCountryChange} error={errors.country?.message} />
            )}
            <PhoneInput
              label="Phone Number *"
              value={watch("phone")}
              onChange={(phone) => setValue("phone", phone, { shouldValidate: true })}
              error={errors.phone?.message}
              countryCode={selectedCountryCode}
              showCountrySelector={buyerType === "international"}
              includeAllCountries
              disabled={buyerType === "international" && !selectedCountry}
              appearance="reference"
              onCountryChange={(code) => {
                const country = getCountryByCode(code);
                if (!country) return;
                setSelectedCountryCode(code);
                setValue("countryCode", code, { shouldValidate: true });
                setValue("country", country.name, { shouldValidate: true });
              }}
            />
          </div>
          <div className="mt-3">
            <Label>Email Address *</Label>
            <Input className={fieldClassName} placeholder="Email Address" autoComplete="email" {...register("email")} />
            {errors.email ? <p className="mt-2 text-[12px] text-[#922B21]">{errors.email.message}</p> : null}
          </div>
        </div>

        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9CA3AF]">Security</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <PasswordInput appearance="reference" label="Password *" placeholder="Password" autoComplete="new-password" error={errors.password?.message} {...register("password")} />
            <PasswordInput appearance="reference" label="Confirm Password *" placeholder="Confirm Password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
          </div>
        </div>

        <label className="flex items-start gap-3 text-[11px] leading-5 text-[#6B7280]">
          <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-[#D1D5DB] accent-[#1E5E27]" {...register("agreedToPolicy")} />
          <span>I accept the Buyer Terms, Marketplace Policies, and Protected-Payment Conditions.</span>
        </label>
        {errors.agreedToPolicy ? <p className="-mt-3 text-[12px] text-[#922B21]">{errors.agreedToPolicy.message}</p> : null}

        {submitError ? <p role="alert" className="rounded-[10px] bg-[#FDECEA] px-4 py-3 text-[12px] text-[#922B21]">{submitError}</p> : null}

        <Button type="submit" disabled={!isValid || isSubmitting} className="h-12 w-full bg-[#1E5E27] hover:bg-[#174B1F]">
          {isSubmitting ? "Creating account..." : <>Create Buyer Account <ArrowRight className="h-4 w-4" /></>}
        </Button>
      </form>
    </div>
  );
}
