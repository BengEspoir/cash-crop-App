"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PhoneInput } from "@/components/auth/PhoneInput";
import { getInternationalCountries } from "@/lib/countries";

function FieldError({ error, className = "mt-2" }) {
  return error ? <p className={`${className} text-[12px] text-[#922B21]`}>{error.message}</p> : null;
}

function CountrySelect({ error, onChange, value }) {
  return (
    <div>
      <Label>Country *</Label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-[8px] border border-[#D1D5DB] bg-white px-3 text-[14px] text-[#111827] outline-none focus:border-[#1A6B3C]"
      >
        <option value="">Select a country</option>
        {getInternationalCountries().map((country) => (
          <option key={country.code} value={country.name}>
            {country.flag} {country.name} ({country.dialCode})
          </option>
        ))}
      </select>
      <FieldError error={error ? { message: error } : null} />
    </div>
  );
}

export function BuyerRegistrationFields({
  buyerType,
  errors,
  onCountryChange,
  onPhoneCountryChange,
  register,
  selectedCountry,
  selectedCountryCode,
  setValue,
  watch,
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Company or Buyer Name *</Label>
          <Input placeholder="Agri Export Ltd." autoComplete="organization" {...register("companyName")} />
          <FieldError error={errors.companyName} />
        </div>
        <div>
          <Label>Contact Name *</Label>
          <Input placeholder="Amina Kofi" autoComplete="name" {...register("contactName")} />
          <FieldError error={errors.contactName} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {buyerType === "local" ? (
          <div>
            <Label>Country *</Label>
            <Input value="Cameroon" disabled className="bg-[#F9FAFB] text-[#6B7280]" />
            <input type="hidden" {...register("country")} value="Cameroon" />
            <input type="hidden" {...register("countryCode")} value="CM" />
          </div>
        ) : (
          <CountrySelect
            value={selectedCountry}
            onChange={onCountryChange}
            error={errors.country?.message}
          />
        )}
        <PhoneInput
          label="Phone Number *"
          value={watch("phone")}
          onChange={(nextPhone) => setValue("phone", nextPhone, { shouldValidate: true })}
          error={errors.phone?.message}
          countryCode={selectedCountryCode}
          onCountryChange={onPhoneCountryChange}
          showCountrySelector={buyerType === "international"}
          disabled={buyerType === "international" && !selectedCountry}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Email Address *</Label>
          <Input placeholder="example@yahoo.com" autoComplete="email" {...register("email")} />
          <FieldError error={errors.email} />
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
      <FieldError error={errors.agreedToPolicy} className="-mt-3" />
    </>
  );
}
