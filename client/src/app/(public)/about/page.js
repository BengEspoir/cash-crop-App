import Link from "next/link";
import { ArrowRight, BadgeCheck, Globe2, HandCoins, ShieldCheck, Sprout } from "lucide-react";
import { AnimatedPageHero } from "../../../components/common/AnimatedPageHero";
import { Reveal, Stagger, StaggerItem } from "../../../components/motion/Reveal";
import { buildMetadata } from "../../../lib/seo";
import { getHeroSlides, landingImagery, pageImagery } from "../../../lib/imagery";

export const metadata = buildMetadata("about");

const impactStats = [
  ["847", "Farmers registered"],
  ["XAF 124M", "Trade volume coordinated"],
  ["634", "Verified farmers"],
  ["38", "Export markets served"],
];

const values = [
  ["Trust & Verification", "Every farmer on AgriculNet is field-verified before full trade access. Trust is the foundation of every order."],
  ["Fair Trade & Farmer Income", "We reduce commission friction, improve price visibility, and keep trade terms transparent for growers."],
  ["Global Reach, Local Roots", "We connect Cameroonian farms to buyers locally, regionally, and internationally without losing local context."],
  ["Simplicity & Accessibility", "Farmers and buyers use one clear workflow for listings, sourcing, payments, and support."],
  ["Sustainability", "We support long-term agricultural trade by emphasizing repeat buyers, consistent quality, and cooperative growth."],
  ["Compliance & Accountability", "Protected payments, inspection records, and verification steps keep every transaction defensible."],
];

const milestones = [
  ["2022", ["Platform formed in Kumba", "First 12 farmers onboarded", "Initial field verification model"]],
  ["2023", ["Payments and sourcing flows piloted", "RFQ workflow introduced", "Regional farmer outreach expanded"]],
  ["2024", ["Buyer protection escrow added", "Export-ready listing path launched", "Multi-region farmer verification"]],
  ["2025", ["ONCC / MINADER alignment formalized", "Compliance content and support expanded", "Cross-border sourcing lane activated"]],
  ["2026", ["API and public marketplace matured", "Mobile money checkout added", "Institutional and export partnerships scaled"]],
];

const team = [
  ["Emmanuel Tchoula", "Co-Founder & CEO", "Farmer-market systems builder focused on practical trade workflows for Cameroon."],
  ["Brigitte Mvaebeme", "Co-Founder & COO", "Leads field operations, partner coordination, and buyer-delivery reliability."],
  ["Alain Nkendrim", "Head of Technology", "Builds the platform rails for verified listings, protected payments, and support tools."],
  ["Dr. Rose Abana", "Head of Compliance", "Aligns AgriculNet verification and export readiness with practical regulatory expectations."],
];

export default function AboutPage() {
  const slides = [landingImagery.hero, pageImagery["trade-support"], ...getHeroSlides().slice(0, 2)];

  return (
    <div className="space-y-14">
      <AnimatedPageHero
        eyebrow="Purpose, values, and vision"
        title="Our mission and the story behind AgriculNet"
        description="AgriculNet exists to close the gap between Cameroonian farmers and the markets they deserve. We are building the rails for trusted local and international agricultural trade."
        slides={slides}
        primaryAction={{ href: "/register/farmer", label: "Register as a Farmer" }}
        secondaryAction={{ href: "/register/buyer", label: "Register as a Buyer" }}
      />

      <Reveal as="section" className="mx-auto max-w-4xl space-y-5 text-center">
        <p className="section-eyebrow">Our mission</p>
        <h2 className="font-display text-[32px] leading-tight text-ink-950 sm:text-[40px]">
          To empower every Cameroonian farmer with the tools, visibility, and trust needed to trade confidently, locally and globally.
        </h2>
        <p className="mx-auto max-w-3xl text-[16px] leading-8 text-ink-500">
          We started from a simple observation: Cameroon produces world-class agricultural crops, but too many farmers still sell with weak visibility, weak payment protection, and weak export support.
          AgriculNet was built to turn that into a tighter system for verified trade.
        </p>
      </Reveal>

      <section className="grid gap-6 lg:grid-cols-2">
        <Reveal className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
          <p className="section-eyebrow">The problem we are solving</p>
          <h2 className="font-display text-[30px] text-ink-950">Cameroon&apos;s farmers face real structural barriers</h2>
          <ul className="mt-5 space-y-3 text-[15px] leading-7 text-ink-600">
            <li>No trusted digital marketplace tied to real field verification.</li>
            <li>Weak price visibility and inconsistent buyer access.</li>
            <li>Limited export coordination around inspection, paperwork, and port readiness.</li>
            <li>Payment delays or informal settlements that reduce confidence for both sides.</li>
          </ul>
        </Reveal>

        <Reveal className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
          <p className="section-eyebrow">How AgriculNet responds</p>
          <h2 className="font-display text-[30px] text-ink-950">A full-stack trade platform built for Cameroon</h2>
          <div className="mt-5 space-y-4">
            {[
              [BadgeCheck, "Digital marketplace with verified profiles"],
              [HandCoins, "Secure payments with buyer protection and seller release controls"],
              [Sprout, "Field verification and crop-quality workflow for real sourcing confidence"],
              [ShieldCheck, "Export coordination with ONCC / MINADER aware compliance guidance"],
              [Globe2, "A sourcing lane that works for local, regional, and global buyers"],
            ].map(([Icon, label]) => (
              <div key={label} className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-800">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="pt-1 text-[15px] leading-7 text-ink-600">{label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <Reveal as="section" className="space-y-6">
        <div className="text-center">
          <p className="section-eyebrow">Our values</p>
          <h2 className="font-display text-[30px] text-ink-950">What we stand for</h2>
          <p className="mt-2 text-[16px] text-ink-500">These principles shape how the platform behaves for buyers, farmers, resellers, and admins.</p>
        </div>
        <Stagger className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {values.map(([title, body], index) => (
            <StaggerItem key={title} className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
              <p className="text-[30px] font-display text-ink-200">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-3 text-[21px] font-semibold text-ink-950">{title}</h3>
              <p className="mt-3 text-[15px] leading-7 text-ink-500">{body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Reveal>

      <Reveal as="section" className="rounded-[32px] bg-green-900 px-6 py-8 text-white shadow-lift sm:px-8 lg:px-10">
        <div className="max-w-2xl">
          <p className="section-eyebrow text-gold-100">Our impact so far</p>
          <h2 className="font-display text-[34px] text-white">Real numbers. Real farmers. Real change.</h2>
          <p className="mt-3 text-[16px] leading-8 text-white/80">
            From a Kumba pilot to a broader sourcing platform, AgriculNet has been expanding the verified trade infrastructure that farmers and buyers actually need.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {impactStats.map(([value, label]) => (
            <div key={label} className="rounded-3xl border border-white/12 bg-white/8 p-5">
              <p className="font-display text-[32px] text-white">{value}</p>
              <p className="mt-2 text-[13px] uppercase tracking-[0.14em] text-white/65">{label}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <section className="space-y-6">
        <div className="text-center">
          <p className="section-eyebrow">The team</p>
          <h2 className="font-display text-[30px] text-ink-950">Built by people who understand Cameroonian agriculture</h2>
        </div>
        <Stagger className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {team.map(([name, role, summary]) => (
            <StaggerItem key={name} className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-[20px] font-semibold text-green-900">
                {name.split(" ").map((part) => part[0]).slice(0, 2).join("")}
              </div>
              <h3 className="mt-4 text-[20px] font-semibold text-ink-950">{name}</h3>
              <p className="mt-1 text-[13px] font-semibold uppercase tracking-[0.12em] text-green-800">{role}</p>
              <p className="mt-3 text-[15px] leading-7 text-ink-500">{summary}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <Reveal as="section" className="space-y-6">
        <div className="text-center">
          <p className="section-eyebrow">Our roadmap</p>
          <h2 className="font-display text-[30px] text-ink-950">Where we&apos;ve been and where we&apos;re going</h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-5">
          {milestones.map(([year, items]) => (
            <div key={year} className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-green-800">{year}</p>
              <ul className="mt-4 space-y-3 text-[14px] leading-6 text-ink-600">
                {items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="rounded-[32px] bg-[#0B3B22] px-6 py-10 text-white shadow-lift sm:px-8 lg:px-10">
        <p className="section-eyebrow text-gold-100">Join the movement</p>
          <h2 className="font-display text-[36px] text-white">Be part of Cameroon&apos;s agricultural transformation</h2>
        <p className="mt-3 max-w-3xl text-[16px] leading-8 text-white/80">
          Whether you are a farmer ready to list your first crop, a buyer looking for verified suppliers, or a partner who believes in trusted trade, AgriculNet is building the rails for that work.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/register/farmer" className="inline-flex h-11 items-center rounded-xl bg-gold-400 px-5 text-[14px] font-semibold text-ink-900">
            Register as a Farmer
          </Link>
          <Link href="/register/buyer" className="inline-flex h-11 items-center rounded-xl border border-white/25 bg-white/10 px-5 text-[14px] font-semibold text-white">
            Register as a Buyer
          </Link>
          <Link href="/international" className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/25 px-5 text-[14px] font-semibold text-white">
            Explore export sourcing
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
