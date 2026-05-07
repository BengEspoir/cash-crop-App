"use client";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDashboardData } from "@/hooks/useDashboardData";
import useAuth from "@/hooks/useAuth";

const valueOrEmpty = (value) => value || "";
const listValue = (value) => Array.isArray(value) ? value.join(", ") : valueOrEmpty(value);

export default function BuyerProfilePage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useDashboardData("buyer");
  const profile = data?.profile || {};

  const accountHealth = [
    { label: "Orders tracked", value: String(data?.orders?.length || 0), delta: "Live buyer orders", trend: "neutral" },
    { label: "Buyer type", value: profile.buyer_type || "Unset", delta: "Saved profile value", trend: "neutral" },
    { label: "Account status", value: user?.status || "Unknown", delta: "Current auth status", trend: "neutral" },
  ];

  if (isLoading) {
    return <EmptyState title="Loading buyer profile" description="Fetching your live buyer account details." />;
  }

  if (error) {
    return <EmptyState title="Profile unavailable" description="The live buyer profile could not be loaded right now." />;
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Buyer profile"
        title="Company details and sourcing identity"
        description="This page shows buyer profile values saved during registration and later account updates."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {accountHealth.map((item) => (
          <KpiCard key={item.label} {...item} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[18px] p-5">
          <h2 className="font-display text-[22px] text-[#111827]">Company profile</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-[13px] font-medium text-[#374151]">Company name</span>
              <Input value={valueOrEmpty(profile.company_name)} readOnly placeholder="No company name saved yet" />
            </label>
            <label className="space-y-2">
              <span className="text-[13px] font-medium text-[#374151]">Primary contact</span>
              <Input
                value={[user?.first_name, user?.last_name].filter(Boolean).join(" ")}
                readOnly
                placeholder="No contact name saved yet"
              />
            </label>
            <label className="space-y-2">
              <span className="text-[13px] font-medium text-[#374151]">Email</span>
              <Input value={valueOrEmpty(user?.email)} readOnly placeholder="No email saved yet" />
            </label>
            <label className="space-y-2">
              <span className="text-[13px] font-medium text-[#374151]">Phone</span>
              <Input value={valueOrEmpty(user?.phone)} readOnly placeholder="No phone saved yet" />
            </label>
            <label className="space-y-2">
              <span className="text-[13px] font-medium text-[#374151]">Country</span>
              <Input value={valueOrEmpty(user?.country || profile.import_country)} readOnly placeholder="No country saved yet" />
            </label>
            <label className="space-y-2">
              <span className="text-[13px] font-medium text-[#374151]">Destination market</span>
              <Input value={valueOrEmpty(profile.destination_market)} readOnly placeholder="No destination saved yet" />
            </label>
          </div>
        </Card>

        <Card className="rounded-[18px] p-5">
          <h2 className="font-display text-[22px] text-[#111827]">Sourcing brief</h2>
          <div className="mt-5 space-y-3">
            {[
              ["Buying focus", listValue(profile.preferred_crops) || "No crops saved yet"],
              ["Annual volume", profile.annual_import_volume || "No volume saved yet"],
              ["Business registration", profile.business_reg_number || "No registration number saved yet"],
              ["Business document", profile.business_doc_url ? "Document URL saved" : "No document uploaded yet"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[12px] bg-[#F9FAFB] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">{label}</p>
                <p className="mt-2 text-[14px] font-medium text-[#111827]">{value}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
