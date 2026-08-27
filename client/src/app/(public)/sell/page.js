import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  FileCheck2,
  Globe2,
  HelpCircle,
} from "lucide-react";
import { SmartImage } from "../../../components/media/SmartImage";
import { buildMetadata } from "../../../lib/seo";

export const metadata = buildMetadata("sell");

const benefits = [
  {
    title: "Buyer visibility",
    body: "Publish crop listings that approved marketplace buyers can discover and inquire about.",
    icon: Globe2,
  },
  {
    title: "Trust verification",
    body: "Complete the platform’s identity and profile checks so buyers can understand your verification state.",
    icon: BadgeCheck,
  },
  {
    title: "Trade support",
    body: "Keep quote conversations, order details, and the available trade documentation in one seller workspace.",
    icon: FileCheck2,
  },
];

const eligibility = [
  ["A real producer or supply business", "Register with the seller type that accurately describes how you source crops."],
  ["Identity and contact details", "Provide the information requested during onboarding and subsequent verification."],
  ["Accurate crop information", "Only publish quantities, locations, prices, and readiness details you can support."],
];

const cropGroups = ["Cocoa & coffee", "Maize & grains", "Plantain & banana", "Pepper & spices", "Cassava", "Palm products"];

const steps = [
  ["Registration", "Create a farmer or reseller profile and add your business details."],
  ["Verification", "Complete the required email, identity, and profile review steps."],
  ["List products", "Publish available crop lots with accurate supply and pricing details."],
  ["Trade", "Respond to buyer inquiries, quotes, and orders from the seller workspace."],
];

export default function SellPage() {
  return (
    <div className="-my-8 space-y-0 lg:-my-10">
      <section className="grid overflow-hidden rounded-[28px] bg-[#EFF8F1] lg:grid-cols-[1.02fr_0.98fr]">
        <div className="flex flex-col justify-center px-6 py-14 sm:px-10 lg:px-14 lg:py-20">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-green-800">Seller platform</p>
          <h1 className="mt-5 max-w-[650px] font-display text-[40px] font-semibold leading-[1.05] text-[#0E4F2A] sm:text-[54px]">
            Grow your agricultural business with verified buyers
          </h1>
          <p className="mt-6 max-w-[620px] text-[17px] leading-8 text-ink-600">
            Create a dedicated seller profile, publish real crop availability, and manage marketplace inquiries from one focused workspace.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link href="/sell/onboarding" className="inline-flex min-h-14 items-center justify-center rounded-[10px] bg-[#1E5E27] px-7 text-[15px] font-bold text-white shadow-[0_12px_24px_rgba(30,94,39,0.2)] hover:bg-green-900">
              Start seller onboarding
            </Link>
            <a href="#requirements" className="inline-flex min-h-14 items-center justify-center rounded-[10px] border border-ink-200 bg-white/50 px-7 text-[15px] font-bold text-ink-800 hover:bg-white">
              View requirements
            </a>
          </div>
        </div>
        <div className="flex items-center justify-center p-7 sm:p-10 lg:p-14">
          <div className="relative h-[370px] w-full rotate-2 overflow-hidden rounded-[30px] border-[12px] border-white bg-green-100 shadow-[0_30px_60px_rgba(26,69,43,0.22)] lg:h-[440px]">
            <SmartImage
              src="/images/famer 1.jpg"
              alt="Farmer standing in an agricultural field"
              fill
              priority
              sizes="(min-width: 1024px) 48vw, 100vw"
              objectPosition="center"
            />
          </div>
        </div>
      </section>

      <section className="px-2 py-20 text-center sm:px-6">
        <h2 className="font-display text-[34px] font-semibold text-[#0E4F2A]">Why sell on AgriculNet?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-7 text-ink-500">
          The marketplace provides the tools needed to present supply clearly and manage buyer conversations.
        </p>
        <div className="mt-12 grid gap-5 text-left md:grid-cols-3">
          {benefits.map(({ title, body, icon: Icon }) => (
            <article key={title} className="rounded-[24px] border border-ink-200 bg-white p-8">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-[12px] bg-green-50 text-green-800">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-6 text-[19px] font-bold text-[#174E2D]">{title}</h3>
              <p className="mt-3 text-[14px] leading-7 text-ink-600">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="requirements" className="grid gap-10 rounded-[28px] bg-[#0C4B2B] px-6 py-14 text-white sm:px-10 lg:grid-cols-2 lg:px-14 lg:py-16">
        <div>
          <h2 className="font-display text-[34px] font-semibold">Who can sell on AgriculNet?</h2>
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-green-100">
            Farmer and reseller accounts are separate from buyer accounts. Choose the path that matches your supply activity.
          </p>
          <ul className="mt-9 space-y-6">
            {eligibility.map(([title, body]) => (
              <li key={title} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-300" />
                <div>
                  <p className="font-bold">{title}</p>
                  <p className="mt-1 text-[13px] leading-6 text-green-200">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-white/5 p-7 sm:p-9">
          <h3 className="font-display text-[25px] font-semibold text-gold-300">Supported crop categories</h3>
          <p className="mt-3 text-[14px] leading-6 text-green-200">Choose your primary commodities during seller onboarding.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {cropGroups.map((crop) => (
              <span key={crop} className="rounded-[10px] bg-white/10 px-4 py-3 text-[14px] font-semibold text-green-50">
                {crop}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="px-2 py-20 text-center sm:px-6">
        <h2 className="font-display text-[34px] font-semibold text-[#0E4F2A]">Onboarding process</h2>
        <ol className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {steps.map(([title, body], index) => (
            <li key={title}>
              <span className="font-display text-[36px] font-semibold text-green-100">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-[16px] font-bold text-ink-900">{title}</h3>
              <p className="mx-auto mt-2 max-w-[260px] text-[13px] leading-6 text-ink-500">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-20 rounded-[28px] border border-green-100 bg-[#F1F9F3] px-6 py-14 text-center sm:px-10">
        <h2 className="font-display text-[32px] font-semibold text-[#0E4F2A]">Ready to grow your agricultural business?</h2>
        <Link href="/sell/onboarding" className="mt-7 inline-flex min-h-14 items-center justify-center gap-2 rounded-[10px] bg-[#1E5E27] px-8 text-[15px] font-bold text-white shadow-[0_12px_24px_rgba(30,94,39,0.2)] hover:bg-green-900">
          Start onboarding now
          <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-5 inline-flex items-center gap-2 text-[13px] text-ink-500">
          <HelpCircle className="h-4 w-4" />
          You will choose between a farmer and reseller profile next.
        </p>
      </section>
    </div>
  );
}
