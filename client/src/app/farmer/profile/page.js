"use client";

import { BadgeCheck, Leaf, Wallet } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { WorkspaceHero } from "@/components/dashboard/WorkspaceHero";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const profileStats = [
  { label: "Verification", value: "Ready", delta: "Phone and email flow completed", icon: BadgeCheck, accent: "green" },
  { label: "Primary crop", value: "Cocoa", delta: "Export grade focus", icon: Leaf, accent: "gold" },
  { label: "Preferred payout", value: "MTN MoMo", delta: "Default settlement channel", icon: Wallet, accent: "green" },
];

export default function FarmerProfilePage() {
  return (
    <section className="space-y-6">
      <WorkspaceHero
        role="farmer"
        eyebrow="Farmer profile"
        title="Farm identity and trade readiness"
        description="Your profile powers how buyers discover and shortlist you. Keep it sharp."
        metrics={[
          { label: "Rating", value: "4.9", caption: "42 reviews" },
          { label: "On-time", value: "96%", caption: "Last 90 days" },
          { label: "Orders", value: "128", caption: "Protected settlement" },
        ]}
      />

      <PageHeader
        eyebrow="Farmer profile"
        title="Manage farm identity"
        description="These profile fields mirror the richer farmer registration flow that now reaches the backend."
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
                <Input defaultValue="Jean" />
              </label>
              <label className="space-y-2">
                <span className="text-[13px] font-medium text-ink-700">Last name</span>
                <Input defaultValue="Ngum" />
              </label>
              <label className="space-y-2">
                <span className="text-[13px] font-medium text-ink-700">Phone</span>
                <Input defaultValue="+237670000111" />
              </label>
              <label className="space-y-2">
                <span className="text-[13px] font-medium text-ink-700">City</span>
                <Input defaultValue="Kumba" />
              </label>
              <label className="space-y-2">
                <span className="text-[13px] font-medium text-ink-700">Primary crop</span>
                <Input defaultValue="Cocoa Beans" />
              </label>
              <label className="space-y-2">
                <span className="text-[13px] font-medium text-ink-700">Harvest volume</span>
                <Input defaultValue="2,000 kg" />
              </label>
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.08}>
          <Card className="rounded-[18px] p-5 shadow-soft">
            <h2 className="font-display text-[22px] text-ink-900">Payout and inspection</h2>
            <div className="mt-5 space-y-3">
              {[
                ["Inspection preference", "AgriculNet coordinated"],
                ["Payout method", "MTN MoMo"],
                ["Account name", "Jean Ngum"],
                ["Notification opt-in", "Enabled"],
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
