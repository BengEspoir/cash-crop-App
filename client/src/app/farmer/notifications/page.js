"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { Reveal } from "@/components/motion/Reveal";
import { Card } from "@/components/ui/card";
import { demoNotifications } from "@/lib/demo-data";

export default function FarmerNotificationsPage() {
  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Farmer notifications"
        title="Trade signals and readiness updates"
        description="Keep buyers moving quickly by acting on inspection, pricing, and dispatch notifications."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Reveal>
          <ActivityFeed items={demoNotifications} />
        </Reveal>
        <Reveal delay={0.08}>
          <Card className="rounded-[18px] p-5 shadow-soft">
            <h2 className="font-display text-[22px] text-ink-900">Notification preferences</h2>
            <p className="mt-2 text-[13px] text-ink-700">
              Real-time alerts keep your protected orders moving. Adjust channels from the settings page.
            </p>
            <ul className="mt-4 space-y-3 text-[13px]">
              {[
                ["SMS", "On — critical updates and dispatch alerts"],
                ["Email", "On — weekly payout digest"],
                ["In-app", "On — full activity stream"],
              ].map(([label, value]) => (
                <li key={label} className="rounded-[12px] bg-ink-50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">{label}</p>
                  <p className="mt-1.5 text-ink-900">{value}</p>
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}
