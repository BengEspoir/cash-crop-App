import { MapPinned, PackageCheck, Route, Ship } from "lucide-react";
import { HeroBanner } from "../../../components/common/HeroBanner";
import { ContentSection, FeatureGrid } from "../../../components/common/ContentSection";
import { pageImagery } from "../../../lib/imagery";

const offerings = [
  { title: "Local routing", body: "Pickup coordination from farm gates to regional aggregation hubs using vetted transporters.", icon: Route },
  { title: "Warehouse staging", body: "Short-term staging and packaging at partner warehouses while orders clear final checks.", icon: PackageCheck },
  { title: "Douala consolidation", body: "Export-ready lots consolidated at the Port of Douala for international buyers.", icon: Ship },
  { title: "Last-mile support", body: "Destination-country handovers coordinated with buyer-side logistics partners.", icon: MapPinned },
];

export default function LogisticsInfoPage() {
  return (
    <div className="space-y-8">
      <HeroBanner
        eyebrow="Logistics"
        title="From farm gate to port, coordinated end-to-end."
        description="AgriculNet&rsquo;s logistics program stitches together vetted transporters, warehouses, and consolidation partners so crops move on schedule."
        image={pageImagery["logistics-info"]}
        primaryAction={{ label: "Coordinate logistics", href: "/contact" }}
      />

      <ContentSection eyebrow="What we coordinate" title="Logistics across the trade chain">
        <FeatureGrid items={offerings} columns={4} />
      </ContentSection>
    </div>
  );
}
