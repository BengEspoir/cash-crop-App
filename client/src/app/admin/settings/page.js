import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AdminSettingsPage() {
  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Admin settings"
        title="Operational controls and environment notes"
        description="Admin controls are connected to the authenticated backend and show operational data only when records exist."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-[18px] p-5">
          <h2 className="font-display text-[22px] text-[#111827]">Access controls</h2>
          <div className="mt-5 grid gap-4">
            <label className="space-y-2">
              <span className="text-[13px] font-medium text-[#374151]">Admin route secret label</span>
              <Input placeholder="Configured server route" autoComplete="off" />
            </label>
            <label className="flex items-center gap-3 rounded-[12px] bg-[#F9FAFB] px-4 py-3">
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#1A6B3C]" />
              <span className="text-[13px] text-[#374151]">Require role check before workspace access</span>
            </label>
          </div>
        </Card>

        <Card className="rounded-[18px] p-5">
          <h2 className="font-display text-[22px] text-[#111827]">Local preview boundary</h2>
          <div className="mt-5 space-y-3">
            {[
              "Authentication, admin review, and dashboard routes use the backend locally.",
              "Orders, listings, messages, logistics, and analytics render from database-backed dashboard endpoints.",
              "Empty states mean no live records have been captured yet.",
            ].map((item) => (
              <div key={item} className="rounded-[12px] bg-[#F9FAFB] px-4 py-3 text-[13px] leading-6 text-[#374151]">
                {item}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
