import Link from "next/link";
import { ArrowRight, Globe2, ShieldCheck, Sprout, WalletCards } from "lucide-react";
import { Button } from "../ui/button";

const statCards = [
  { label: "Verified farmers", value: "340+", icon: ShieldCheck },
  { label: "Export-ready listings", value: "120", icon: Globe2 },
  { label: "Protected payment rails", value: "7", icon: WalletCards },
  { label: "Active crop categories", value: "18", icon: Sprout },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-[24px] bg-[#1A6B3C] px-6 py-10 shadow-[0_30px_80px_rgba(15,23,42,0.14)] lg:px-12 lg:py-14 animate-fade-in">
      <div className="relative grid gap-8 lg:grid-cols-12 lg:items-center">
        <div className="space-y-5 lg:col-span-7 animate-slide-up">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F7EDD5]">Agricultural Trade Platform</p>
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#F7EDD5] shadow-sm animate-bounce-in">
              Agricultural trade platform
            </span>
            <h1 className="max-w-3xl font-display text-[32px] leading-[1.08] text-white sm:text-[38px] lg:text-[44px]">
              Trusted crop trade from Cameroonian farms to local and international markets.
            </h1>
            <p className="max-w-2xl text-[15px] leading-8 text-white/85">
              Discover verified farmers, structured crop listings, protected payments, and export-ready trade support in one clear marketplace.
            </p>
            <p className="text-[13px] font-medium uppercase tracking-[0.22em] text-[#F7EDD5]">
              Des fermes camerounaises aux marchés du monde
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary" className="border-white bg-white text-[#1A6B3C] hover:bg-[#F3F4F6]">
              <Link href="/register/farmer">Register as Farmer</Link>
            </Button>
            <Button asChild variant="outline" className="border-white bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link href="/register/buyer">Register as Buyer</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
              <Link href="/browse" className="inline-flex items-center gap-2">
                Browse listings
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5 animate-slide-up">
          {statCards.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-[18px] border border-white/20 bg-white/10 p-5 text-white shadow-sm backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[12px] text-white/70">{label}</p>
                <Icon className="h-5 w-5 text-[#E8B84B] animate-float" />
              </div>
              <p className="mt-4 text-[26px] font-semibold leading-none">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
