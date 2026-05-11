import { Card } from "../ui/card";
import { TierBadge } from "../ui/badge";

export function ActivityFeed({ items = [] }) {
  return (
    <Card variant="elevated" className="rounded-[16px] p-5">
      <h2 className="font-display text-[20px] text-ink-900">Recent activity</h2>
      <div className="mt-4 space-y-2">
        {items.map((item, index) => (
          <div
            key={item.id || index}
            className="group rounded-[12px] border border-ink-100 bg-ink-50 px-4 py-3 transition-all duration-200 hover:border-green-200 hover:bg-green-50/50"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-ink-800">{item.title}</p>
              {item.status ? <TierBadge status={item.status} size="sm" /> : null}
            </div>
            <p className="mt-2 text-[13px] leading-6 text-ink-600">{item.detail}</p>
            {item.time && (
              <p className="mt-1 text-[11px] text-ink-400">{item.time}</p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
