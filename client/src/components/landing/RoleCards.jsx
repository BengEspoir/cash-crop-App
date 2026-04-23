"use client";

import Link from "next/link";
import { ArrowRight, Building2, Tractor } from "lucide-react";
import { Card } from "../ui/card";
import { Stagger, StaggerItem } from "../motion/Reveal";

const roles = [
  {
    title: "Register as Farmer",
    body: "Create verified listings, receive quote requests, and manage protected payouts from local and international buyers.",
    href: "/register/farmer",
    icon: Tractor,
    accent: "bg-green-100 text-green-800",
    border: "border-t-[4px] border-t-green-800",
  },
  {
    title: "Register as Buyer",
    body: "Source from verified farmers, request export-ready supply, and track protected orders with clearer trade visibility.",
    href: "/register/buyer",
    icon: Building2,
    accent: "bg-gold-100 text-gold-800",
    border: "border-t-[4px] border-t-gold-700",
  },
];

export function RoleCards() {
  return (
    <Stagger as="section" className="grid gap-4 lg:grid-cols-2" stagger={0.08}>
      {roles.map(({ title, body, href, icon: Icon, accent, border }) => (
        <StaggerItem key={title} className="h-full">
          <Card interactive className={`group h-full rounded-2xl p-6 ${border}`}>
            <Link href={href} className="block h-full">
              <div className="flex items-start justify-between gap-4">
                <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${accent} transition-colors duration-200 group-hover:bg-green-800 group-hover:text-white`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-green-800 transition-transform duration-200 group-hover:translate-x-1">
                  Start
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
              <h2 className="mt-5 font-display text-[22px] leading-[1.15] text-ink-800">{title}</h2>
              <p className="mt-3 text-[14px] leading-6 text-ink-700">{body}</p>
            </Link>
          </Card>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
