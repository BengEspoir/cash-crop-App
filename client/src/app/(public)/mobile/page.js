import { Bell, Download, Signal, Smartphone } from "lucide-react";
import { HeroBanner } from "../../../components/common/HeroBanner";
import { ContentSection, FeatureGrid } from "../../../components/common/ContentSection";
import { pageImagery } from "../../../lib/imagery";

const features = [
  { title: "Optimised for low bandwidth", body: "Core flows work on 3G connections with aggressive caching for listing images and order history.", icon: Signal },
  { title: "Offline draft listings", body: "Capture crop details and photos in the field — they'll upload automatically when you're back online.", icon: Smartphone },
  { title: "Push notifications", body: "Quote requests, order confirmations, and payment releases are delivered in real time.", icon: Bell },
  { title: "Light install footprint", body: "Slim APK and progressive web app install so it works on entry-level Android devices.", icon: Download },
];

export default function MobilePage() {
  return (
    <div className="space-y-8">
      <HeroBanner
        eyebrow="Mobile App"
        title="AgriculNet works where your farm does."
        description="A mobile-first experience built for the realities of Cameroonian agriculture — low connectivity, field hours, and pickup windows that don't wait for a desktop."
        image={pageImagery.mobile}
        primaryAction={{ label: "Get early access", href: "/contact" }}
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
        <p className="font-display text-[18px] text-ink-800">Native apps are in closed beta.</p>
        <p className="mt-2 text-[13px] text-ink-700">
          Join the waitlist through our contact team to help us pressure-test on your region&rsquo;s networks.
        </p>
      </div>
    </div>
  );
}
