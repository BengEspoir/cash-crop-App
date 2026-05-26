import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BuyerSettingsPage() {
  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Buyer settings"
        title="Security, notifications, and sourcing defaults"
        description="Buyer settings are prepared for live account values and remain blank until the buyer saves preferences."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-[18px] p-5">
          <h2 className="font-display text-[22px] text-[#111827]">Security</h2>
          <div className="mt-5 grid gap-4">
            <p className="text-[14px] leading-6 text-[#374151]">Recovery contacts and password changes are managed from the editable buyer profile security panel.</p>
            <Button asChild variant="accent-gold">
              <Link href="/buyer/profile">Open profile security</Link>
            </Button>
            <label className="flex items-center gap-3 rounded-[12px] bg-[#F9FAFB] px-4 py-3">
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#1A6B3C]" />
              <span className="text-[13px] text-[#374151]">Require phone verification before high-value orders</span>
            </label>
            <label className="flex items-center gap-3 rounded-[12px] bg-[#F9FAFB] px-4 py-3">
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#1A6B3C]" />
              <span className="text-[13px] text-[#374151]">Email me when export documents are updated</span>
            </label>
          </div>
        </Card>

        <Card className="rounded-[18px] p-5">
          <h2 className="font-display text-[22px] text-[#111827]">Trade defaults</h2>
          <div className="mt-5 space-y-3">
            {[
              ["Preferred destination", "No saved destination yet"],
              ["Settlement mode", "No saved settlement preference yet"],
              ["Inspection handling", "No saved inspection preference yet"],
              ["Live data", "Orders, documents, and quotes appear here only after database records exist"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[12px] bg-[#F9FAFB] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">{label}</p>
                <p className="mt-2 text-[14px] font-medium text-[#111827]">{value}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
