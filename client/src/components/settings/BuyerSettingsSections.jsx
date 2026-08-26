"use client";

import { Bell, CreditCard, Globe2, Lock, ShieldCheck, UserCircle2 } from "lucide-react";
import { BuyerButton, BuyerPanel, BuyerStatusBadge } from "@/components/buyer/BuyerDesignSystem";

const PAYMENT_METHODS = [
  { key: "mtn_momo", label: "MTN MoMo", detail: "Primary mobile money", live: true },
  { key: "orange_money", label: "Orange Money", detail: "Backup mobile money", live: true },
  { key: "card", label: "Visa / Mastercard", detail: "Display only", live: false },
];

const NOTIFICATION_OPTIONS = [
  ["orderUpdates", "Order Updates", "Confirmations, shipping, delivery alerts"],
  ["newMessages", "New Messages", "Farmer replies and sourcing inquiries"],
  ["paymentNotifications", "Payment Notifications", "Hosted checkout and escrow updates"],
  ["priceAlerts", "Price Alerts", "Saved crop price changes"],
  ["platformUpdates", "Platform Updates", "Features and announcements"],
];

const PRIVACY_OPTIONS = [
  ["buyerVisibility", "Show my buyer profile to farmers", "Verified farmers can see your buyer identity during sourcing conversations."],
  ["orderHistoryVisible", "Share order history with sellers", "Lets verified sellers use completed buyer history as sourcing context."],
  ["useDataRecommendations", "Allow AgriculNet to use my data for recommendations", "Improves crop and seller suggestions in browse and messaging flows."],
  ["marketing", "Marketing communications", "Receive seasonal crop alerts, new farmer announcements, and platform promotions."],
];

export const buyerDefaultNotifications = {
  orderUpdates: { sms: true, email: true, push: true },
  newMessages: { sms: false, email: true, push: true },
  paymentNotifications: { sms: true, email: true, push: true },
  priceAlerts: { sms: false, email: true, push: true },
  platformUpdates: { sms: false, email: true, push: false },
};

export function BuyerSettingsNavigation() {
  const items = [
    [UserCircle2, "Account"],
    [Bell, "Notifications"],
    [CreditCard, "Payment Methods"],
    [Lock, "Security"],
    [Globe2, "Language & Region"],
    [ShieldCheck, "Privacy"],
  ];

  return (
    <aside className="space-y-3 rounded-2xl border border-ink-200 bg-white p-4">
      {items.map(([Icon, label], index) => (
        <div key={label} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium ${index === 0 ? "bg-green-50 text-green-800" : "text-ink-500"}`}>
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </div>
      ))}
    </aside>
  );
}

export function BuyerAccountSettings({ user, displayName }) {
  return (
    <BuyerPanel title="Account preferences">
      <div className="grid gap-4 md:grid-cols-2">
        <ReadonlyField label="Display name" value={displayName || "Buyer"} />
        <ReadonlyField label="Business name" value={user?.company_name || "Buyer account"} />
        <ReadonlyField label="Email address" value={user?.email || "Not available"} badge="Verified" />
        <ReadonlyField label="Phone number" value={user?.phone || "Not available"} badge="Verified" />
        <ReadonlyField label="Region" value={user?.region || "Cameroon"} />
        <ReadonlyField label="City" value={user?.city || "Cameroon"} />
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <BuyerButton href="/buyer/profile" variant="outline">Open profile editor</BuyerButton>
        <BuyerButton href="/buyer/profile" variant="ghost">Manage recovery contacts</BuyerButton>
      </div>
    </BuyerPanel>
  );
}

export function BuyerNotificationSettings({ notifications, onToggle }) {
  return (
    <BuyerPanel title="Notification preferences">
      <div className="space-y-4">
        {NOTIFICATION_OPTIONS.map(([key, title, description]) => (
          <div key={key} className="grid gap-3 rounded-2xl border border-ink-100 px-4 py-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-[16px] font-semibold text-ink-950">{title}</p>
              <p className="mt-1 text-[13px] text-ink-500">{description}</p>
            </div>
            <div className="flex items-center gap-3">
              {["sms", "email", "push"].map((channel) => (
                <label key={channel} className="flex items-center gap-2 text-[12px] font-semibold uppercase text-ink-400">
                  <span>{channel}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(notifications[key]?.[channel])}
                    onChange={() => onToggle(key, channel)}
                    className="h-4 w-4 accent-green-800"
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </BuyerPanel>
  );
}

export function BuyerPaymentSettings({ selectedChannel, onChange }) {
  return (
    <BuyerPanel title="Payment methods" action={<BuyerButton variant="outline" className="h-11 px-4" disabled>Add Method</BuyerButton>}>
      <div className="space-y-3">
        {PAYMENT_METHODS.map((method) => {
          const active = selectedChannel === method.key;
          return (
            <div key={method.key} className={`rounded-2xl border px-4 py-4 ${active ? "border-green-800 bg-green-50/60" : "border-ink-100 bg-white"}`}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-[16px] font-semibold text-ink-950">{method.label}</p>
                    {active ? <BuyerStatusBadge status="verified">Primary</BuyerStatusBadge> : null}
                    {!method.live ? <BuyerStatusBadge status="pending">Coming soon</BuyerStatusBadge> : null}
                  </div>
                  <p className="mt-1 text-[13px] text-ink-500">{method.detail}</p>
                </div>
                <div className="flex gap-3">
                  {method.live ? (
                    <BuyerButton
                      type="button"
                      variant={active ? "ghost" : "outline"}
                      className="h-10 px-4"
                      onClick={() => onChange(method.key)}
                    >
                      {active ? "Selected" : "Set Primary"}
                    </BuyerButton>
                  ) : (
                    <BuyerButton type="button" variant="outline" className="h-10 px-4" disabled>
                      Unavailable
                    </BuyerButton>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-4 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-[13px] text-green-900">
        Live buyer checkout currently uses Fapshi hosted payment with MTN MoMo and Orange Money. Additional display methods stay disabled until provider support exists.
      </p>
    </BuyerPanel>
  );
}

export function BuyerSecuritySettings() {
  return (
    <BuyerPanel title="Security">
      <div className="space-y-4">
        <SecurityRow title="Password" detail="Change your password and primary contact methods from the buyer profile security editor.">
          <BuyerButton href="/buyer/profile" variant="outline" className="h-10 px-4">Open Security</BuyerButton>
        </SecurityRow>
        <SecurityRow title="Two-Factor Authentication (2FA)" detail="Planned enhancement for buyer logins and higher-risk payment approval.">
          <BuyerStatusBadge status="pending">Coming soon</BuyerStatusBadge>
        </SecurityRow>
        <SecurityRow title="Active Sessions" detail="Current session controls and full sign-out management are not yet available in the dashboard UI.">
          <BuyerStatusBadge status="pending">Coming soon</BuyerStatusBadge>
        </SecurityRow>
      </div>
    </BuyerPanel>
  );
}

export function BuyerLocaleSettings({ form, onChange }) {
  return (
    <BuyerPanel title="Language & Region">
      <div className="grid gap-4 md:grid-cols-2">
        <ChoiceCard
          active={form.language === "en"}
          title="English"
          description="Default platform language"
          onClick={() => onChange("language", "en")}
        />
        <ChoiceCard
          active={form.language === "fr"}
          title="Français"
          description="French support for public and dashboard UI"
          onClick={() => onChange("language", "fr")}
        />
        <label className="space-y-2">
          <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-400">Timezone</span>
          <select value={form.timezone} onChange={(event) => onChange("timezone", event.target.value)} className="h-12 w-full rounded-xl border border-ink-200 px-3">
            <option>Africa/Douala (WAT +01:00)</option>
            <option>UTC</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-400">Currency display</span>
          <select value={form.currencyDisplay} onChange={(event) => onChange("currencyDisplay", event.target.value)} className="h-12 w-full rounded-xl border border-ink-200 px-3">
            <option>XAF - CFA Franc</option>
            <option>EUR - Euro</option>
            <option>USD - US Dollar</option>
          </select>
        </label>
      </div>
    </BuyerPanel>
  );
}

export function BuyerPrivacySettings({ form, onChange }) {
  return (
    <BuyerPanel title="Privacy & Visibility">
      <div className="space-y-3">
        {PRIVACY_OPTIONS.map(([key, title, description]) => (
          <label key={key} className="flex items-start justify-between gap-4 rounded-2xl border border-ink-100 px-4 py-4">
            <div>
              <p className="text-[16px] font-semibold text-ink-950">{title}</p>
              <p className="mt-1 text-[13px] text-ink-500">{description}</p>
            </div>
            <input
              type="checkbox"
              checked={Boolean(form[key])}
              onChange={() => onChange(key, !form[key])}
              className="mt-1 h-4 w-4 accent-green-800"
            />
          </label>
        ))}
      </div>
    </BuyerPanel>
  );
}

export function BuyerDangerZone() {
  return (
    <section className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5">
      <h2 className="font-display text-[24px] text-red-900">Danger Zone</h2>
      <p className="mt-2 text-[14px] leading-6 text-red-800/80">
        These actions are permanent. Deactivation and deletion remain managed through account support until the dedicated self-serve workflow is implemented.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <BuyerButton variant="outline" className="h-11 border-red-200 text-red-800" disabled>Deactivate Account</BuyerButton>
        <BuyerButton variant="outline" className="h-11 border-red-200 text-red-800" disabled>Delete My Account</BuyerButton>
      </div>
    </section>
  );
}

function ReadonlyField({ label, value, badge }) {
  return (
    <div className="rounded-2xl border border-ink-100 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-400">{label}</span>
        {badge ? <BuyerStatusBadge status="verified">{badge}</BuyerStatusBadge> : null}
      </div>
      <p className="mt-3 text-[15px] font-medium text-ink-950">{value}</p>
    </div>
  );
}

function SecurityRow({ title, detail, children }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-ink-100 px-4 py-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-[16px] font-semibold text-ink-950">{title}</p>
        <p className="mt-1 text-[13px] text-ink-500">{detail}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function ChoiceCard({ active, title, description, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-2xl border px-4 py-4 text-left transition ${active ? "border-green-800 bg-green-50/60" : "border-ink-100 bg-white hover:border-green-200"}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[16px] font-semibold text-ink-950">{title}</p>
          <p className="mt-1 text-[13px] text-ink-500">{description}</p>
        </div>
        {active ? <BuyerStatusBadge status="verified">Active</BuyerStatusBadge> : null}
      </div>
    </button>
  );
}
