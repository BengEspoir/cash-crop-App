"use client";

import { BadgeCheck, Leaf, Wallet } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { WorkspaceHero } from "@/components/dashboard/WorkspaceHero";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDashboardData } from "@/hooks/useDashboardData";
import useAuth from "@/hooks/useAuth";

const valueOrEmpty = (value) => value || "";

export default function FarmerProfilePage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useDashboardData("farmer");
  const profile = data?.profile || {};
  const metrics = data?.metrics || {};

  const profileStats = [
    {
      label: "Verification",
      value: user?.status || "Unknown",
      delta: "Current account status",
      icon: BadgeCheck,
      accent: "green",
      trend: "neutral",
    },
    {
      label: "Primary crop",
      value: profile.primary_crop || "Unset",
      delta: "Saved farm profile value",
      icon: Leaf,
      accent: "gold",
      trend: "neutral",
    },
    {
      label: "Preferred payout",
      value: profile.payout_method || "Unset",
      delta: "Saved settlement preference",
      icon: Wallet,
      accent: "green",
      trend: "neutral",
    },
  ];

  if (isLoading) {
    return <EmptyState title="Loading farmer profile" description="Fetching your live farmer account details." />;
  }

  if (error) {
    return <EmptyState title="Profile unavailable" description="The live farmer profile could not be loaded right now." />;
  }

  return (
    <section className="space-y-6">
      <WorkspaceHero
        role="farmer"
        eyebrow="Farmer profile"
        title="Farm identity and trade readiness"
        description="Your profile powers how buyers discover and shortlist you. Live values appear as soon as records exist."
        metrics={[
          { label: "Listings", value: String(metrics.activeListings || 0), caption: "Active database records" },
          { label: "Orders", value: String(metrics.openOrders || 0), caption: "Live order records" },
          { label: "Revenue", value: metrics.protectedRevenue || "XAF 0", caption: "Protected settlement total" },
        ]}
      />

      <PageHeader
        eyebrow="Farmer profile"
        title="Manage farm identity"
        description="These profile fields are loaded from the farmer account created during registration."
      />

      <Stagger className="grid gap-4 md:grid-cols-3">
        {profileStats.map((item) => (
          <StaggerItem key={item.label}>
            <KpiCard {...item} />
          </StaggerItem>
        ))}
      </Stagger>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Reveal>
          <Card className="rounded-[18px] p-5 shadow-soft">
            <h2 className="font-display text-[22px] text-ink-900">Farmer details</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[13px] font-medium text-ink-700">First name</span>
                <Input value={valueOrEmpty(user?.first_name)} readOnly placeholder="No first name saved yet" />
              </label>
              <label className="space-y-2">
                <span className="text-[13px] font-medium text-ink-700">Last name</span>
                <Input value={valueOrEmpty(user?.last_name)} readOnly placeholder="No last name saved yet" />
              </label>
              <label className="space-y-2">
                <span className="text-[13px] font-medium text-ink-700">Phone</span>
                <Input value={valueOrEmpty(user?.phone)} readOnly placeholder="No phone saved yet" />
              </label>
              <label className="space-y-2">
                <span className="text-[13px] font-medium text-ink-700">City</span>
                <Input value={valueOrEmpty(user?.city)} readOnly placeholder="No city saved yet" />
              </label>
              <label className="space-y-2">
                <span className="text-[13px] font-medium text-ink-700">Primary crop</span>
                <Input value={valueOrEmpty(profile.primary_crop)} readOnly placeholder="No crop saved yet" />
              </label>
              <label className="space-y-2">
                <span className="text-[13px] font-medium text-ink-700">Harvest volume</span>
                <Input value={valueOrEmpty(profile.harvest_volume)} readOnly placeholder="No harvest volume saved yet" />
              </label>
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.08}>
          <Card className="rounded-[18px] p-5 shadow-soft">
            <h2 className="font-display text-[22px] text-ink-900">Payout and inspection</h2>
            <div className="mt-5 space-y-3">
              {[
                ["Inspection preference", profile.inspection_preference || "No inspection preference saved yet"],
                ["Payout method", profile.payout_method || "No payout method saved yet"],
                ["Account name", profile.payout_account_name || "No payout account saved yet"],
                ["Notification opt-in", profile.notification_opt_in ? "Enabled" : "Not enabled"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[12px] bg-ink-50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">{label}</p>
                  <p className="mt-2 text-[14px] font-medium text-ink-900">{value}</p>
                </div>
              ))}
            </div>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}
