import { Bell, Download, Signal, Smartphone } from "lucide-react";
import { HeroBanner } from "../../../components/common/HeroBanner";
import { ContentSection, FeatureGrid } from "../../../components/common/ContentSection";
import { pageImagery } from "../../../lib/imagery";
import { buildMetadata } from "../../../lib/seo";

export const metadata = buildMetadata("mobile");

const features = [
  { title: "Optimised for low bandwidth", body: "Public pages and images use bounded caching while private identity, payment, message, and admin data stay network-only.", icon: Signal },
  { title: "Offline draft listings", body: "Capture listing details in the field, then review and publish them after the connection returns.", icon: Smartphone },
  { title: "Opt-in push notifications", body: "Enable privacy-safe browser alerts from Settings on supported devices.", icon: Bell },
  { title: "Light install footprint", body: "Install the progressive web app from a supported browser without downloading a native package.", icon: Download },
];

export default function MobilePage() {
  return (
    <div className="space-y-8">
      <HeroBanner
        eyebrow="Mobile App"
        title="AgriculNet works where your farm does."
        description="A mobile-first experience built for the realities of Cameroonian agriculture — low connectivity, field hours, and pickup windows that don't wait for a desktop."
        image={pageImagery.mobile}
        primaryAction={{ label: "Open AgriculNet", href: "/" }}
        secondaryAction={{ label: "Browse on web", href: "/browse" }}
      />

      <ContentSection
        eyebrow="Features"
        title="Designed for field use"
        description="Everything you can do from a browser — listing management, quote review, chat — works on mobile with hardware-friendly performance."
      >
        <FeatureGrid items={features} columns={4} />
      </ContentSection>

      <div className="rounded-2xl border border-dashed border-ink-300 bg-ink-50 p-6 text-center">
        <p className="font-display text-[18px] text-ink-800">Install the AgriculNet web app.</p>
        <p className="mt-2 text-[13px] text-ink-700">
          Use your browser&rsquo;s install action when available. On iPhone, use Safari Share and Add to Home Screen.
        </p>
      </div>
    </div>
  );
}
