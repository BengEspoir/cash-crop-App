import Link from "next/link";
import { BadgeCheck, ClipboardCheck, FileBadge2, Leaf, ShieldCheck, Users2 } from "lucide-react";
import { AnimatedPageHero } from "../../../components/common/AnimatedPageHero";
import { Reveal, Stagger, StaggerItem } from "../../../components/motion/Reveal";
import { buildMetadata } from "../../../lib/seo";
import { getHeroSlides, pageImagery } from "../../../lib/imagery";

export const metadata = buildMetadata("compliance");

const bodies = [
  {
    name: "National Cocoa & Coffee Board (ONCC)",
    short: "Applied where cocoa and coffee listings require quality grade references and export handling discipline.",
    points: [
      "Quality grading references for cocoa and coffee listings",
      "Inspection-aware listing readiness before export promotion",
      "Document coordination for crop lots moving into export flow",
    ],
  },
  {
    name: "Ministry of Agriculture & Rural Development (MINADER)",
    short: "Applied where farmer identity, cooperative presence, crop traceability, and field inspection support matter.",
    points: [
      "Farmer and cooperative identity cross-checks",
      "Regional agricultural context for listings and logistics",
      "Inspection and field-visit workflows tied to marketplace activity",
    ],
  },
];

const cropStandards = [
  ["Cocoa & coffee", "ONCC grading and quality-reference alignment for export-ready lots."],
  ["Penja pepper", "Origin-sensitive quality review with documentation before export promotion."],
  ["Export banana", "Phytosanitary and port-prep workflow before shipment readiness."],
  ["Palm oil & food crops", "Traceability, packing, and buyer-protection records around each trade flow."],
  ["Cereals, roots, and tubers", "Regional sourcing records plus inspection support where required."],
  ["Fresh ginger", "Export handling discipline and crop-status review before international listing promotion."],
];

const verificationSteps = [
  "Farmer registration submitted with business, identity, and location details.",
  "Cross-check against available cooperative, regional, and verification records.",
  "Field review or verification workflow opened where higher-trust activity is required.",
  "Crop category standards applied before export-ready promotion.",
  "Verified badge and listing status only appear when required checks are complete.",
];

const faqs = [
  "Does AgriculNet have an official partnership with ONCC?",
  "How does AgriculNet verify a farmer is registered with MINADER?",
  "What documents does a buyer receive for an export order?",
  "Is ONCC grading mandatory for all cocoa listings?",
  "Can a farmer lose their verified badge?",
];

export default function CompliancePage() {
  const slides = [pageImagery.verification, pageImagery["documentation-info"], ...getHeroSlides().slice(0, 2)];

  return (
    <div className="space-y-14">
      <AnimatedPageHero
        eyebrow="Institutional compliance and verification"
        title="AgriculNet and official Cameroonian agricultural bodies"
        description="AgriculNet operates with practical compliance awareness around ONCC and MINADER so buyers can source from a platform that treats verification, documentation, and export readiness seriously."
        slides={slides}
        primaryAction={{ href: "/international", label: "Explore Export Sourcing" }}
        secondaryAction={{ href: "/request-quote", label: "Request a Quote" }}
      />

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Reveal className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
          <p className="section-eyebrow">Why compliance matters</p>
          <h2 className="font-display text-[30px] text-ink-950">Trading on a platform buyers can trust</h2>
          <p className="mt-4 text-[15px] leading-8 text-ink-500">
            AgriculNet&apos;s trust model depends on more than profile forms. For sensitive crop categories and export-oriented trade, the platform uses a verification workflow that aligns with how Cameroon&apos;s agricultural institutions actually operate.
          </p>
          <ul className="mt-5 space-y-3 text-[15px] leading-7 text-ink-600">
            <li>Farmer verification is tied to real-world identity and regional context.</li>
            <li>Export promotion is held back until compliance-sensitive checks are satisfied.</li>
            <li>Inspection, paperwork, and trade support are visible parts of the buyer journey.</li>
          </ul>
        </Reveal>

        <Reveal className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
          <p className="section-eyebrow">Platform compliance stats</p>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            {[
              ["634", "Verified farmers"],
              ["215", "Export-ready listings"],
              ["100%", "Cocoa / coffee grading aware"],
              ["38", "Export markets"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl bg-ink-50 p-5">
                <p className="font-display text-[30px] text-ink-950">{value}</p>
                <p className="mt-2 text-[13px] uppercase tracking-[0.14em] text-ink-400">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-[14px] text-green-900">
            Platform compliance is enforced through listing states, verification review, buyer-protection controls, and admin oversight.
          </div>
        </Reveal>
      </section>

      <section className="space-y-6">
        <div>
          <p className="section-eyebrow">Our regulatory partners</p>
          <h2 className="font-display text-[30px] text-ink-950">The bodies that govern Cameroonian agriculture</h2>
        </div>
        <Stagger className="grid gap-5 lg:grid-cols-2">
          {bodies.map((body, index) => (
            <StaggerItem key={body.name} className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
              <div className="flex items-start gap-3">
                <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${index === 0 ? "bg-green-100 text-green-900" : "bg-gold-100 text-gold-800"}`}>
                  {index === 0 ? <Leaf className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
                </span>
                <div>
                  <h3 className="text-[22px] font-semibold text-ink-950">{body.name}</h3>
                  <p className="mt-2 text-[15px] leading-7 text-ink-500">{body.short}</p>
                </div>
              </div>
              <ul className="mt-5 space-y-3 text-[15px] leading-7 text-ink-600">
                {body.points.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-green-700" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <Reveal as="section" className="space-y-6">
        <div>
          <p className="section-eyebrow">Compliance by crop type</p>
          <h2 className="font-display text-[30px] text-ink-950">Which standards apply to each crop</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {cropStandards.map(([title, body], index) => {
            const icon = [BadgeCheck, FileBadge2, ClipboardCheck, Users2, ShieldCheck, Leaf][index % 6];
            const Icon = icon;
            return (
              <Reveal key={title} className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-50 text-green-800">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-[20px] font-semibold text-ink-950">{title}</h3>
                <p className="mt-3 text-[15px] leading-7 text-ink-500">{body}</p>
              </Reveal>
            );
          })}
        </div>
      </Reveal>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Reveal className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
          <p className="section-eyebrow">How we verify</p>
          <h2 className="font-display text-[30px] text-ink-950">The AgriculNet compliance verification process</h2>
          <div className="mt-5 space-y-4">
            {verificationSteps.map((step, index) => (
              <div key={step} className="flex gap-4 rounded-2xl border border-ink-100 p-4">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-800 text-[14px] font-semibold text-white">{index + 1}</span>
                <p className="pt-1 text-[15px] leading-7 text-ink-600">{step}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="rounded-[30px] bg-green-900 p-6 text-white shadow-lift">
          <p className="section-eyebrow text-gold-100">Need help with compliance?</p>
          <h3 className="mt-3 font-display text-[30px] text-white">Talk to our compliance & verification team</h3>
          <p className="mt-3 text-[15px] leading-7 text-white/80">
            Our team can help farmers understand listing requirements and help buyers understand how verified export-ready listings are screened.
          </p>
          <div className="mt-6 space-y-3 text-[14px] text-white/85">
            <p>Phone: +237 670 000 000</p>
            <p>Compliance desk: compliance@agriculnet.cm</p>
            <p>Office: Yaounde, Centre Region, Cameroon</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/contact" className="inline-flex h-11 items-center rounded-xl bg-gold-400 px-5 text-[14px] font-semibold text-ink-900">Contact Compliance Team</Link>
            <Link href="/international" className="inline-flex h-11 items-center rounded-xl border border-white/25 px-5 text-[14px] font-semibold text-white">Back to Export Program</Link>
          </div>
        </Reveal>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
          <p className="section-eyebrow">Frequently asked</p>
          <h2 className="font-display text-[30px] text-ink-950">Compliance questions</h2>
          <div className="mt-5 space-y-3">
            {faqs.map((question, index) => (
              <div key={question} className="rounded-2xl border border-ink-100 px-4 py-4">
                <p className="text-[16px] font-semibold text-ink-950">{question}</p>
                {index === 0 ? (
                  <p className="mt-2 text-[14px] leading-6 text-ink-500">
                    AgriculNet aligns its workflow with ONCC and MINADER-aware verification practices. That is not the same as claiming those institutions run the platform, but it does mean listings and export-readiness checks are designed around their real expectations.
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
          <p className="section-eyebrow">Next step</p>
          <h2 className="font-display text-[30px] text-ink-950">Move from compliance to real sourcing</h2>
          <p className="mt-3 text-[15px] leading-7 text-ink-500">
            Once you understand the compliance layer, the next step is to source from export-ready listings, submit an RFQ, and let the protected payment and verification rails do their work.
          </p>
          <div className="mt-6 space-y-3">
            <Link href="/browse" className="flex items-center justify-between rounded-2xl border border-ink-100 px-4 py-4 text-[15px] font-semibold text-green-800">
              Browse verified listings
              <span aria-hidden>+</span>
            </Link>
            <Link href="/request-quote" className="flex items-center justify-between rounded-2xl border border-ink-100 px-4 py-4 text-[15px] font-semibold text-green-800">
              Request a quote
              <span aria-hidden>+</span>
            </Link>
            <Link href="/buyer-protection" className="flex items-center justify-between rounded-2xl border border-ink-100 px-4 py-4 text-[15px] font-semibold text-green-800">
              Review buyer protection
              <span aria-hidden>+</span>
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
