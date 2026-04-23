"use client";

import { BadgeCheck, Shield, Truck, WalletCards } from "lucide-react";
import { Card } from "../ui/card";
import { Stagger, StaggerItem } from "../motion/Reveal";

const items = [
  { title: "Verified seller profiles", copy: "Farmer profiles are reviewed before listings go live for buyers.", icon: BadgeCheck },
  { title: "Buyer protection", copy: "Inspection support, dispute handling, and trade assistance are built in.", icon: Shield },
  { title: "Coordinated logistics", copy: "Move from quote to shipment with export documentation support.", icon: Truck },
  { title: "Protected payouts", copy: "Use mobile money, cards, and transfer-ready settlement flows.", icon: WalletCards },
];

export function TrustStrip() {
  return (
    <Stagger as="section" className="grid gap-4 lg:grid-cols-4" stagger={0.06}>
      {items.map(({ title, copy, icon: Icon }) => (
        <StaggerItem key={title}>
          <Card className="group h-full rounded-2xl p-5 transition-all duration-200 hover:-translate-y-[2px] hover:border-green-800 hover:shadow-glow">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-800 transition-colors duration-200 group-hover:bg-green-800 group-hover:text-white">
              <Icon className="h-4 w-4" />
            </span>
            <h3 className="mt-4 text-[15px] font-semibold text-ink-800">{title}</h3>
            <p className="mt-2 text-[13px] leading-6 text-ink-700">{copy}</p>
          </Card>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
