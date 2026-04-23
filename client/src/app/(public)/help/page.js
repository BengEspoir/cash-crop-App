import { BookOpen, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { HeroBanner } from "../../../components/common/HeroBanner";
import { ContentSection, FeatureGrid } from "../../../components/common/ContentSection";
import { FAQ } from "../../../components/common/FAQ";
import { pageImagery } from "../../../lib/imagery";

const categories = [
  { title: "Getting started", body: "Create your account, verify identity, and complete your first listing or purchase order.", icon: BookOpen },
  { title: "Protected payments", body: "How payment holds, releases, and dispute windows work for both buyers and farmers.", icon: ShieldCheck },
  { title: "Chat with support", body: "Reach the AgriculNet desk in English or French — weekdays 08:00–18:00 WAT.", icon: MessageCircle },
  { title: "Phone escalation", body: "Urgent shipment or inspection issues can be escalated to our trade coordinator.", icon: Phone },
];

const faqs = [
  { q: "How do I get verified as a farmer?", a: "Submit your ID, a cooperative reference (if applicable), and one recent farm photo. Reviews typically complete in 48 hours, and we email a status update when your verification is live." },
  { q: "When is payment released to me?", a: "Payments are held until the buyer confirms delivery or an AgriculNet inspection signs off. Releases usually happen within 24 hours of confirmation." },
  { q: "Can I sell without being on Cameroon soil?", a: "You can list from anywhere, but settlement through the protected payment rail is currently scoped to Cameroon-registered producers and cooperative members." },
  { q: "How are inspections coordinated?", a: "For export-ready listings, we partner with accredited third-party inspectors. You'll see available slots when a buyer requests a protected order." },
  { q: "Does AgriculNet charge listing fees?", a: "Listing is free. We charge a small transaction fee on completed protected orders — see the Pricing page for the current rate card." },
];

export default function HelpPage() {
  return (
    <div className="space-y-8">
      <HeroBanner
        eyebrow="Help Center"
        title="Support for farmers, buyers, and cooperatives."
        description="Find answers about verification, protected payments, and shipping coordination, or reach the AgriculNet team directly when something's off."
        image={pageImagery.help}
        primaryAction={{ label: "Contact support", href: "/contact" }}
        secondaryAction={{ label: "Browse marketplace", href: "/browse" }}
      />

      <ContentSection
        eyebrow="Topics"
        title="Pick what you need help with"
        description="Each topic links to detailed walkthroughs inside the workspace, or you can jump straight to a human on the support team."
      >
        <FeatureGrid items={categories} columns={4} />
      </ContentSection>

      <ContentSection eyebrow="Common Questions" title="Frequently asked">
        <FAQ items={faqs} />
      </ContentSection>
    </div>
  );
}
