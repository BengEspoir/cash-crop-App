import { Card } from "../ui/card";

export function EarningsChart({ title = "Performance trend", items = [] }) {
  const highestValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <Card className="rounded-[16px] p-5">
      <h2 className="font-display text-[20px] text-[#111827]">{title}</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
        <div className="flex items-end gap-3 rounded-[16px] bg-[#F9FAFB] p-4">
          {items.map((item) => (
            <div key={item.label} className="flex flex-1 flex-col items-center gap-3">
              <div className="flex h-[180px] w-full items-end rounded-[14px] bg-white px-2 py-2">
                <div
                  className="w-full rounded-[10px] bg-[#2E8B57]"
                  style={{ height: `${Math.max((item.value / highestValue) * 100, 10)}%` }}
                />
              </div>
              <div className="text-center">
                <p className="text-[12px] font-semibold text-[#111827]">{item.label}</p>
                <p className="text-[11px] text-[#6B7280]">{item.caption}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div key={`${item.label}-summary`} className="rounded-[14px] border border-[#E5E7EB] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">{item.label}</p>
              <p className="mt-2 text-[18px] font-semibold text-[#111827]">{item.displayValue}</p>
              <p className="mt-1 text-[12px] leading-5 text-[#374151]">{item.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
