import Link from "next/link";
import { CircleCheckBig, FileCheck2, Globe2, PackageCheck, ShieldCheck, Ship } from "lucide-react";
import { AnimatedPageHero } from "../../../components/common/AnimatedPageHero";
import { Reveal, Stagger, StaggerItem } from "../../../components/motion/Reveal";
import { buildMetadata } from "../../../lib/seo";
import { getHeroSlides, pageImagery, resolveListingImage } from "../../../lib/imagery";
import { SmartImage } from "../../../components/media/SmartImage";

export const metadata = buildMetadata("international");

const processSteps = [
  ["Browse & Filter", "Search export-ready crops by type, volume, grade, and region."],
  ["Request a Quote", "Open a formal RFQ for the selected crop lot and quantity."],
  ["Inspection & Docs", "AgriculNet coordinates quality checks and export paperwork."],
  ["Douala Port Dispatch", "Cargo is consolidated and moved through Douala Port."],
  ["Delivered Worldwide", "Shipment tracking stays visible until arrival."],
];

const exportListings = [
  ["Cocoa Grade A", "XAF 2,100 / kg", "1,200 kg available"],
  ["Penja White Pepper", "XAF 18,000 / kg", "300 kg available"],
  ["Arabica Coffee", "XAF 3,400 / kg", "800 kg available"],
  ["Export Banana", "XAF 950 / kg", "5,000 kg available"],
  ["Robusta Coffee", "XAF 2,800 / kg", "1,500 kg available"],
  ["Fresh Ginger", "XAF 1,100 / kg", "900 kg available"],
];

const faqs = [
  "What crops are available for export from Cameroon?",
  "How does quality inspection work?",
  "Can I request sample lots before placing a full order?",
  "What is the minimum export order quantity?",
  "How long does shipping from Douala Port take?",
];

export default function InternationalPage() {
  const slides = [pageImagery["trade-support"], pageImagery["documentation-info"], ...getHeroSlides().slice(0, 2)];

  return (
    <div className="space-y-14">
      <AnimatedPageHero
        eyebrow="Cameroon's premier export agricultural hub"
        title="Source Verified Cameroonian Crops for Global Markets"
        description="Access export-ready crops from verified Cameroonian farmers and resellers. AgriculNet coordinates quality inspection, phytosanitary documentation, and Douala Port readiness."
        slides={slides}
        primaryAction={{ href: "/browse", label: "Browse Export Catalogue" }}
        secondaryAction={{ href: "/request-quote", label: "Request a Quote" }}
      />

      <section className="grid gap-4 md:grid-cols-5">
        {[
          [CircleCheckBig, "215+", "Export-ready farmers"],
          [Globe2, "38", "Destination countries"],
          [ShieldCheck, "XAF 124M", "Trade volume coordinated"],
          [FileCheck2, "100%", "ONCC / MINADER aligned"],
          [Ship, "Douala Port", "Export coordination"],
        ].map(([Icon, value, label]) => (
          <Reveal key={label} className="rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
            <Icon className="h-5 w-5 text-green-800" />
            <p className="mt-4 font-display text-[28px] text-ink-950">{value}</p>
            <p className="mt-2 text-[13px] uppercase tracking-[0.14em] text-ink-400">{label}</p>
          </Reveal>
        ))}
      </section>

      <Reveal as="section" className="space-y-6">
        <div>
          <p className="section-eyebrow">The export process</p>
          <h2 className="font-display text-[30px] text-ink-950">From Cameroonian farm to your port</h2>
          <p className="mt-2 max-w-2xl text-[16px] text-ink-500">AgriculNet manages the export pipeline so buyers can focus on sourcing, not port logistics.</p>
        </div>
        <Stagger className="grid gap-4 lg:grid-cols-5">
          {processSteps.map(([title, body], index) => (
            <StaggerItem key={title} className="rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-800 text-[14px] font-semibold text-white">{index + 1}</span>
              <h3 className="mt-4 text-[18px] font-semibold text-ink-950">{title}</h3>
              <p className="mt-2 text-[15px] leading-7 text-ink-500">{body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Reveal>

      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-eyebrow">Export catalogue</p>
            <h2 className="font-display text-[30px] text-ink-950">Export-ready crops</h2>
          </div>
          <Link href="/browse" className="text-[14px] font-semibold text-green-800">View all export listings</Link>
        </div>
        <Stagger className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {exportListings.map(([crop, price, detail]) => (
            <StaggerItem key={crop} className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-soft">
              <div className="relative h-48">
                <SmartImage src={resolveListingImage({ crop })} alt={crop} fill sizes="(min-width: 1280px) 30vw, 50vw" className="object-cover" />
              </div>
              <div className="space-y-3 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-[24px] text-ink-950">{crop}</h3>
                  <span className="rounded-full bg-green-50 px-3 py-1 text-[12px] font-semibold text-green-800">Export-ready</span>
                </div>
                <p className="text-[18px] font-semibold text-green-800">{price}</p>
                <p className="text-[14px] text-ink-500">{detail}</p>
                <Link href="/request-quote" className="text-[14px] font-semibold text-green-800">View / Quote</Link>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Reveal className="space-y-5">
          <p className="section-eyebrow">What you need to know</p>
          <h2 className="font-display text-[30px] text-ink-950">Export requirements and documentation</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["Mandatory Export Documents", "Phytosanitary certificate, certificate of origin, ONCC quality certificate, invoice, and shipping references."],
              ["Quality Grading & Inspection", "On-site inspection, moisture check, and compliance review before export readiness is confirmed."],
              ["Douala Port Logistics", "Container booking, customs coordination, and port handling support through AgriculNet partners."],
              ["International Payment Methods", "Protected settlement with hosted mobile money checkout and traceable order records."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
                <h3 className="text-[18px] font-semibold text-ink-950">{title}</h3>
                <p className="mt-3 text-[15px] leading-7 text-ink-500">{body}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="rounded-[28px] bg-green-900 p-6 text-white shadow-lift">
          <p className="section-eyebrow text-gold-100">International sourcing desk</p>
          <h3 className="mt-3 font-display text-[30px] text-white">Talk to our export specialist</h3>
          <p className="mt-3 text-[15px] leading-7 text-white/80">
            Our team is available to help you source the right crops, verify compliance, and coordinate your full export order.
          </p>
          <div className="mt-6 space-y-3 text-[14px] text-white/85">
            <p>Phone / WhatsApp: +237 677 000 000</p>
            <p>Export enquiries: export@agriculnet.cm</p>
            <p>Response time: within 4 business hours</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/request-quote" className="inline-flex h-11 items-center rounded-xl bg-gold-400 px-5 text-[14px] font-semibold text-ink-900">Request a Formal Quote</Link>
            <Link href="/compliance" className="inline-flex h-11 items-center rounded-xl border border-white/25 px-5 text-[14px] font-semibold text-white">View Compliance Standards</Link>
          </div>
        </Reveal>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal className="rounded-2xl border border-ink-200 bg-white p-6 shadow-soft">
          <p className="section-eyebrow">FAQ</p>
          <h2 className="font-display text-[30px] text-ink-950">Common export questions</h2>
          <div className="mt-5 space-y-3">
            {faqs.map((question, index) => (
              <div key={question} className="rounded-2xl border border-ink-100 px-4 py-4">
                <p className="text-[16px] font-semibold text-ink-950">{question}</p>
                {index === 0 ? <p className="mt-2 text-[14px] leading-6 text-ink-500">Cameroonian export-ready crops include cocoa, arabica coffee, penja pepper, export banana, palm oil, robusta coffee, and verified ginger.</p> : null}
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal className="rounded-[28px] bg-[#0D4E2A] p-6 text-white shadow-lift">
          <h3 className="font-display text-[28px]">Secure payments - Cameroonian and international methods</h3>
          <p className="mt-3 text-[15px] leading-7 text-white/80">All transactions are escrow-protected. AgriculNet only releases seller funds after the verified delivery workflow is complete.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["MTN MoMo", "Orange Money", "Visa", "Mastercard", "Wire"].map((item) => (
              <span key={item} className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[12px] font-semibold text-white/90">{item}</span>
            ))}
          </div>
        </Reveal>
      </section>
    </div>
  );
}
