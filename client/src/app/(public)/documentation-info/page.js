import { FileStack, Globe2, Receipt, Stamp } from "lucide-react";
import { HeroBanner } from "../../../components/common/HeroBanner";
import { ContentSection, FeatureGrid } from "../../../components/common/ContentSection";
import { pageImagery } from "../../../lib/imagery";

const docs = [
  { title: "Invoices & receipts", body: "Auto-generated invoices and settlement receipts for every protected order.", icon: Receipt },
  { title: "Certificates of origin", body: "Support requesting certificates of origin and phytosanitary papers for export lots.", icon: Stamp },
  { title: "Cross-border packages", body: "Pre-packaged document sets tailored to common destination countries.", icon: Globe2 },
  { title: "Record keeping", body: "All verified documents stored against your account for future audits and buyer reference.", icon: FileStack },
];

export default function DocumentationInfoPage() {
  return (
    <div className="space-y-8">
      <HeroBanner
        eyebrow="Documentation"
        title="The paperwork buyers and customs actually ask for."
        description="We help farmers and cooperatives prepare the documentation expected in cross-border trade, with a template library and live support."
        image={pageImagery["documentation-info"]}
        primaryAction={{ label: "Get documentation help", href: "/contact" }}
      />

      <ContentSection eyebrow="Document types" title="Supported documentation">
        <FeatureGrid items={docs} columns={4} />
      </ContentSection>
    </div>
  );
}
