import { Clipboard, Microscope, PackageSearch, ShieldCheck } from "lucide-react";
import { HeroBanner } from "../../../components/common/HeroBanner";
import { ContentSection, FeatureGrid } from "../../../components/common/ContentSection";
import { pageImagery } from "../../../lib/imagery";

const areas = [
  { title: "Quality checks", body: "Moisture, foreign matter, size grading, and packaging quality assessed against buyer specs.", icon: Microscope },
  { title: "Quantity verification", body: "Weight, count, or volume verified and recorded with timestamps before handover.", icon: PackageSearch },
  { title: "Certification review", body: "Support confirming valid certifications such as traceability or cooperative audits.", icon: Clipboard },
  { title: "Release assurance", body: "Inspection sign-off feeds directly into the protected payment release workflow.", icon: ShieldCheck },
];

export default function InspectionsInfoPage() {
  return (
    <div className="space-y-8">
      <HeroBanner
        eyebrow="Inspections"
        title="Independent checks that protect both sides of the trade."
        description="We coordinate accredited, third-party inspectors so buyers and farmers can both trust the numbers on any protected order."
        image={pageImagery["inspections-info"]}
        primaryAction={{ label: "Request inspection", href: "/contact" }}
      />

      <ContentSection eyebrow="What inspectors cover" title="Scope of an AgriculNet inspection">
        <FeatureGrid items={areas} columns={4} />
      </ContentSection>
    </div>
  );
}
