"use client";

import { Input, inputClasses } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { PhoneInput } from "@/components/auth/PhoneInput";
import { regions } from "@/constants/regions";

function FieldError({ error, className = "mt-2" }) {
  return error ? <p className={`${className} text-[12px] text-[#922B21]`}>{error.message}</p> : null;
}

function PersonalStep({ errors, password, register, setValue, watch }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>First Name *</Label>
          <Input placeholder="e.g. Jean" autoComplete="given-name" {...register("firstName")} />
          <FieldError error={errors.firstName} />
        </div>
        <div>
          <Label>Last Name *</Label>
          <Input placeholder="e.g. Ngum" autoComplete="family-name" {...register("lastName")} />
          <FieldError error={errors.lastName} />
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
          <FieldError error={errors.email} />
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
          <FieldError error={errors.region} />
        </div>
        <div>
          <Label>City / Town *</Label>
          <Input placeholder="e.g. Kumba" {...register("city")} />
          <FieldError error={errors.city} />
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4 text-[13px] text-[#374151]">
        <input type="checkbox" className="mt-1 h-4 w-4 rounded border-[#D1D5DB]" {...register("acceptedTerms")} />
        <span>I agree to AgriculNet&apos;s Terms of Use and Privacy Policy.</span>
      </label>
      <FieldError error={errors.acceptedTerms} className="-mt-3" />
    </>
  );
}

function FarmDetailsStep({ errors, register }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label>Primary Crop *</Label>
        <Input placeholder="Cocoa Beans" {...register("primaryCrop")} />
        <FieldError error={errors.primaryCrop} />
      </div>
      <div>
        <Label>Estimated Harvest Volume *</Label>
        <Input placeholder="e.g. 2,000 kg" {...register("harvestVolume")} />
        <FieldError error={errors.harvestVolume} />
      </div>
      <div>
        <Label>Farm or Cooperative Name *</Label>
        <Input placeholder="e.g. Kumba Growers Union" {...register("cooperative")} />
        <FieldError error={errors.cooperative} />
      </div>
      <div>
        <Label>Inspection Preference *</Label>
        <Input placeholder="AgriculNet coordinated" {...register("inspectionPreference")} />
        <FieldError error={errors.inspectionPreference} />
      </div>
      <label className="sm:col-span-2 flex items-start gap-3 rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4 text-[13px] text-[#374151]">
        <input type="checkbox" className="mt-1 h-4 w-4 rounded border-[#D1D5DB]" {...register("exportReady")} />
        <span>My produce is prepared for export checks and buyer documentation.</span>
      </label>
    </div>
  );
}

function PayoutStep({ errors, register, setValue, watch }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label>Payout Method *</Label>
        <Input placeholder="MTN MoMo" {...register("payoutMethod")} />
        <FieldError error={errors.payoutMethod} />
      </div>
      <div>
        <Label>Account Name *</Label>
        <Input placeholder="Jean Ngum" {...register("accountName")} />
        <FieldError error={errors.accountName} />
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
  );
}

export function FarmerRegistrationSteps({ currentStep, errors, password, register, setValue, watch }) {
  if (currentStep === 0) {
    return <PersonalStep errors={errors} password={password} register={register} setValue={setValue} watch={watch} />;
  }
  if (currentStep === 1) {
    return <FarmDetailsStep errors={errors} register={register} />;
  }
  return <PayoutStep errors={errors} register={register} setValue={setValue} watch={watch} />;
}
