"use client";

import {
  farmerSettingsSections,
  FarmerButton,
  FarmerPanel,
} from "@/components/farmer/FarmerDesignSystem";
import { Input } from "@/components/ui/input";

const FARMER_NOTIFICATION_OPTIONS = [
  "SMS when a buyer sends a new inquiry",
  "Email when payout status changes",
  "Alerts for inspection schedule updates",
];

export function FarmerSettingsNavigation() {
  return (
    <aside className="space-y-3">
      {farmerSettingsSections.map((item, index) => {
        const Icon = item.icon;
        return (
          <button
            key={item.title}
            type="button"
            className={`flex h-16 w-full items-center gap-4 rounded-lg px-6 text-left text-[18px] font-bold transition ${index === 0 ? "bg-white text-green-800 shadow-sm" : "text-ink-600 hover:bg-white hover:text-green-800"}`}
          >
            <Icon className="h-5 w-5" />
            {item.title}
          </button>
        );
      })}
    </aside>
  );
}

export function FarmerRegionalPreferences() {
  return (
    <FarmerPanel title="Regional Preferences">
      <p className="-mt-2 mb-8 text-[17px] text-ink-500">Set your language and timezone settings.</p>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-[15px] font-semibold text-ink-700">Language</span>
          <Input readOnly value="English (Cameroon)" className="h-14 rounded-lg text-[16px]" />
        </label>
        <label className="space-y-2">
          <span className="text-[15px] font-semibold text-ink-700">Currency</span>
          <Input readOnly value="XAF - CFA Franc BEAC" className="h-14 rounded-lg text-[16px]" />
        </label>
        <label className="space-y-2 md:col-span-2">
          <span className="text-[15px] font-semibold text-ink-700">Timezone</span>
          <Input readOnly value="(GMT+01:00) West Africa Time - Yaounde" className="h-14 rounded-lg text-[16px]" />
        </label>
      </div>
      <div className="mt-8 flex justify-end">
        <FarmerButton variant="outline" disabled>Preference saving coming soon</FarmerButton>
      </div>
    </FarmerPanel>
  );
}

export function FarmerPasswordSettings() {
  return (
    <FarmerPanel title="Change Password">
      <p className="-mt-2 mb-8 text-[17px] text-ink-500">Password changes are managed from the editable profile security panel.</p>
      <FarmerButton href="/farmer/profile" variant="gold">Open profile security</FarmerButton>
    </FarmerPanel>
  );
}

export function FarmerNotificationSettings() {
  return (
    <FarmerPanel title="Notification Settings">
      <div className="space-y-4">
        {FARMER_NOTIFICATION_OPTIONS.map((label) => (
          <label key={label} className="flex items-center gap-4 rounded-lg border border-ink-100 px-5 py-4">
            <input type="checkbox" defaultChecked className="h-5 w-5 accent-green-800" />
            <span className="text-[16px] font-medium text-ink-700">{label}</span>
          </label>
        ))}
      </div>
    </FarmerPanel>
  );
}
