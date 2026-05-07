import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function FarmerSettingsPage() {
  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Farmer settings"
        title="Workflow preferences and account controls"
        description="Account preferences are ready for live data and will stay empty until saved by the farmer."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-[18px] p-5">
          <h2 className="font-display text-[22px] text-[#111827]">Notifications</h2>
          <div className="mt-5 space-y-3">
            {[
              "SMS when a buyer sends a new inquiry",
              "Email when payout status changes",
              "Alerts for inspection schedule updates",
            ].map((label) => (
              <label key={label} className="flex items-center gap-3 rounded-[12px] bg-[#F9FAFB] px-4 py-3">
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#1A6B3C]" />
                <span className="text-[13px] text-[#374151]">{label}</span>
              </label>
            ))}
          </div>
        </Card>

        <Card className="rounded-[18px] p-5">
          <h2 className="font-display text-[22px] text-[#111827]">Default trade setup</h2>
          <div className="mt-5 grid gap-4">
            <label className="space-y-2">
              <span className="text-[13px] font-medium text-[#374151]">Preferred payout phone</span>
              <Input placeholder="+2376..." autoComplete="tel" />
            </label>
            <label className="space-y-2">
              <span className="text-[13px] font-medium text-[#374151]">Fallback account name</span>
              <Input placeholder="Account holder name" autoComplete="name" />
            </label>
            <label className="space-y-2">
              <span className="text-[13px] font-medium text-[#374151]">Inspection routing</span>
              <Input placeholder="Preferred inspection route" />
            </label>
          </div>
        </Card>
      </div>
    </section>
  );
}
