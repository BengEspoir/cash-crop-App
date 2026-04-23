"use client";

import { CheckCircle2, Clock, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Card } from "@/components/ui/card";
import { demoPayments } from "@/lib/demo-data";

const paymentStats = [
  { label: "Released payouts", value: "XAF 2.48M", delta: "Across verified orders", icon: CheckCircle2, accent: "green" },
  { label: "Pending release", value: "XAF 420K", delta: "Awaiting dispatch completion", icon: Clock, accent: "gold", trend: "neutral" },
  { label: "Payout channels", value: "3", delta: "MoMo, Orange Money, bank", icon: CreditCard, accent: "green" },
];

export default function FarmerPaymentsPage() {
  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Farmer payments"
        title="Protected payout visibility"
        description="Review release status, preferred settlement channels, and payout readiness from the farmer workspace."
      />

      <Stagger className="grid gap-4 md:grid-cols-3">
        {paymentStats.map((item) => (
          <StaggerItem key={item.label}>
            <KpiCard {...item} />
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal>
        <Card className="rounded-[18px] p-5 shadow-soft">
          <h2 className="font-display text-[22px] text-ink-900">Recent payouts</h2>
          <Stagger className="mt-4 grid gap-4 xl:grid-cols-3">
            {demoPayments.map((payment) => (
              <StaggerItem key={payment.id}>
                <Card className="rounded-[16px] border border-ink-100 p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="section-eyebrow">{payment.id}</p>
                      <h3 className="mt-2 font-display text-[22px] text-ink-900">{payment.amountLabel}</h3>
                    </div>
                    <StatusBadge status={payment.status} />
                  </div>
                  <p className="mt-4 text-[13px] text-ink-700">Beneficiary: {payment.party}</p>
                  <p className="mt-1 text-[12px] text-ink-500">Channel: {payment.channel}</p>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </Card>
      </Reveal>
    </section>
  );
}
