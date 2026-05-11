import { BadgeCheck, Shield, Truck, WalletCards } from "lucide-react";
import { Card } from "../ui/card";

const items = [
  { title: "Verified seller profiles", copy: "Farmer profiles are reviewed before listings go live for buyers.", icon: BadgeCheck },
  { title: "Buyer protection", copy: "Inspection support, dispute handling, and trade assistance are built in.", icon: Shield },
  { title: "Coordinated logistics", copy: "Move from quote to shipment with export documentation support.", icon: Truck },
  { title: "Protected payouts", copy: "Use mobile money, cards, and transfer-ready settlement flows.", icon: WalletCards },
];

export function TrustStrip() {
  return (
    <section className="grid gap-4 lg:grid-cols-4 animate-fade-in">
      {items.map(({ title, copy, icon: Icon }, index) => (
        <Card
          key={title}
          className={`rounded-[18px] border-transparent p-5 shadow-[0_24px_80px_rgba(26,107,60,0.08)] ${
            index % 2 === 0
              ? "bg-[#D4EDDA]"
              : "bg-[#FFF1D1]"
          } animate-bounce-in`}
        >
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#1A6B3C] shadow-sm">
            <Icon className="h-5 w-5" />
          </span>
          <h3 className="mt-4 text-[15px] font-semibold text-[#111827]">{title}</h3>
          <p className="mt-3 text-[14px] leading-7 text-[#374151]">{copy}</p>
        </Card>
      ))}
    </section>
  );
}
