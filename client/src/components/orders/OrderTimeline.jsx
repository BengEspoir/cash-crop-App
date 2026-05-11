import { Card } from "../ui/card";
import { OrderStatusBadge } from "./OrderStatusBadge";

export function OrderTimeline({ items = [] }) {
  return (
    <Card variant="elevated" className="rounded-[16px] p-5">
      <h2 className="font-display text-[20px] text-ink-900">Order timeline</h2>
      <div className="mt-4 space-y-4">
        {items.map((item, index) => (
          <div key={`${item.label}-${item.date}`} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="h-3 w-3 rounded-full bg-green-800" />
              {index < items.length - 1 ? <span className="mt-2 h-full w-px bg-ink-200" /> : null}
            </div>
            <div className="flex-1 pb-2">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-ink-800">{item.label}</p>
                <OrderStatusBadge status={item.status} />
              </div>
              <p className="mt-1 text-[13px] text-ink-500">{item.date}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
