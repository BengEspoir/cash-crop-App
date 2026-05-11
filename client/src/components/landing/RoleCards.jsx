import Link from "next/link";
import { Building2, Tractor } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

const roles = [
  {
    title: "Register as Farmer",
    body: "Create verified listings, receive quote requests, and manage protected payouts from local and international buyers.",
    href: "/register/farmer",
    icon: Tractor,
    accent: "bg-[#EAF4EE] text-[#1A6B3C]",
    border: "bg-[#1A6B3C] text-white",
  },
  {
    title: "Register as Buyer",
    body: "Source from verified farmers, request export-ready supply, and track protected orders with clearer trade visibility.",
    href: "/register/buyer",
    icon: Building2,
    accent: "bg-[#FFE9B5] text-[#8A6200]",
    border: "bg-[#F59E0B] text-white",
  },
];

export function RoleCards() {
  return (
    <section className="grid gap-6 lg:grid-cols-2 animate-fade-in">
      {roles.map(({ title, body, href, icon: Icon, accent, border }) => (
        <Card
          key={title}
          interactive
          className={`rounded-[26px] border-transparent ${accent} p-6 shadow-[0_24px_80px_rgba(90,126,63,0.12)] animate-slide-up`}
        >
          <div className="flex items-start justify-between gap-4">
            <span className={`inline-flex h-14 w-14 items-center justify-center rounded-[18px] ${border}`}>
              <Icon className="h-6 w-6" />
            </span>
            <Button asChild variant="secondary">
              <Link href={href}>Start</Link>
            </Button>
          </div>
          <h2 className="mt-6 font-display text-[24px] leading-[1.15] text-[#111827]">{title}</h2>
          <p className="mt-4 text-[15px] leading-7 text-[#374151]">{body}</p>
        </Card>
      ))}
    </section>
  );
}
