"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowLeft, ArrowRight, Check, Tractor, Warehouse } from "lucide-react";

const options = [
  {
    title: "Farmer / Primary Producer",
    body: "Choose this path when you directly grow or produce the crops you plan to list.",
    href: "/register/farmer?from=sell",
    icon: Tractor,
    tone: "green",
    requirements: ["Identity and contact details", "Farm location and production details", "Crops you grow and plan to sell"],
  },
  {
    title: "Reseller / Aggregator",
    body: "Choose this path when you consolidate or resell agricultural supply from producers or cooperatives.",
    href: "/register/reseller?from=sell",
    icon: Warehouse,
    tone: "gold",
    requirements: ["Identity and contact details", "Business or facility information", "Crops you source and plan to resell"],
  },
];

const comparison = [
  ["Supply source", "Direct production", "Aggregated or resold supply"],
  ["Profile information", "Farm and crop details", "Business, facility, and sourcing details"],
  ["Marketplace access", "Dedicated seller workspace", "Dedicated seller workspace"],
  ["Trade workflow", "Listings, inquiries, quotes, orders", "Listings, inquiries, quotes, orders"],
];

const SELLER_COOKIE = "agriculnet_seller_intent=1; Path=/; Max-Age=3600; SameSite=Lax";

export default function SellerOnboardingChooserPage() {
  useEffect(() => {
    document.cookie = SELLER_COOKIE;
  }, []);

  return (
    <section className="-my-8 pb-16 lg:-my-10 lg:pb-20">
      <div className="flex justify-end border-b border-ink-200 py-5">
        <Link href="/sell" className="inline-flex items-center gap-2 text-[13px] font-bold text-ink-600 hover:text-green-800">
          <ArrowLeft className="h-4 w-4" />
          Back to Sell Overview
        </Link>
      </div>

      <div className="mx-auto max-w-[1080px] pt-16">
        <div className="text-center">
          <h1 className="font-display text-[42px] font-semibold leading-tight text-[#0E4F2A] sm:text-[50px]">Choose your seller path</h1>
          <p className="mx-auto mt-4 max-w-3xl text-[17px] leading-8 text-ink-600">
            Select the profile type that accurately describes your agricultural business so the correct onboarding and verification fields are shown.
          </p>
        </div>

        <div className="mt-14 grid gap-7 lg:grid-cols-2">
          {options.map((option) => {
            const Icon = option.icon;
            const isGold = option.tone === "gold";
            return (
              <article key={option.title} className="flex flex-col rounded-[28px] border border-ink-200 bg-white p-7 sm:p-9">
                <span className={`inline-flex h-16 w-16 items-center justify-center rounded-[18px] ${
                  isGold ? "bg-amber-50 text-amber-500" : "bg-green-50 text-green-800"
                }`}>
                  <Icon className="h-8 w-8" />
                </span>
                <h2 className="mt-9 font-display text-[29px] font-semibold text-[#174E2D]">{option.title}</h2>
                <p className="mt-4 min-h-[84px] text-[15px] leading-7 text-ink-600">{option.body}</p>

                <div className={`mt-5 rounded-[18px] p-6 ${isGold ? "bg-amber-50/70" : "bg-green-50"}`}>
                  <p className={`text-[11px] font-bold uppercase tracking-[0.16em] ${isGold ? "text-amber-700" : "text-green-800"}`}>What to prepare</p>
                  <ul className="mt-4 space-y-3">
                    {option.requirements.map((requirement) => (
                      <li key={requirement} className="flex items-center gap-3 text-[14px] text-ink-700">
                        <Check className={`h-4 w-4 shrink-0 ${isGold ? "text-amber-500" : "text-green-700"}`} />
                        {requirement}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={option.href}
                  className={`mt-9 inline-flex min-h-14 items-center justify-center gap-2 rounded-[12px] px-6 text-[15px] font-bold shadow-sm ${
                    isGold ? "bg-amber-400 text-[#153B27] hover:bg-amber-500" : "bg-[#1E5E27] text-white hover:bg-green-900"
                  }`}
                >
                  Select {isGold ? "Reseller" : "Farmer"} Path
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            );
          })}
        </div>

        <div className="mt-16">
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.18em] text-ink-500">Path comparison</p>
          <div className="mt-6 overflow-x-auto rounded-[20px] border border-ink-200 bg-white">
            <table className="w-full min-w-[720px] text-left text-[14px]">
              <thead className="bg-green-50 text-[#174E2D]">
                <tr>
                  <th className="px-6 py-5 font-bold">Feature</th>
                  <th className="px-6 py-5 font-bold">Farmer</th>
                  <th className="px-6 py-5 font-bold">Reseller</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row[0]} className="border-t border-ink-100">
                    {row.map((cell, index) => (
                      <td key={cell} className={`px-6 py-5 text-ink-700 ${index === 0 ? "font-semibold text-ink-900" : ""}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-14 text-center">
          <p className="text-[14px] text-ink-500">Not sure which profile matches your activity?</p>
          <Link href="/contact" className="mt-3 inline-flex items-center gap-2 text-[15px] font-bold text-green-800 hover:text-green-900">
            Contact onboarding support
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

