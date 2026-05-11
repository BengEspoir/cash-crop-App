import { Clock } from "lucide-react";
import { Card } from "../ui/card";
import { TierBadge } from "../ui/badge";
import { cn } from "../../lib/utils";

export function PendingQueue({ title = "Pending queue", items = [] }) {
  return (
    <Card variant="elevated" className="rounded-[16px] p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[20px] text-ink-900">{title}</h2>
        {items.length > 0 && (
          <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-100 px-1.5 text-[10px] font-bold text-amber-700">
            {items.length}
          </span>
        )}
      </div>
      <div className="mt-4 space-y-2">
        {items.map((item, index) => {
          const isUrgent = item.urgent || item.priority === "high";
          return (
            <div
              key={item.id || index}
              className={cn(
                "group flex items-start justify-between gap-3 rounded-[12px] border px-4 py-3 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-soft",
                isUrgent
                  ? "border-amber-200 bg-amber-50 hover:border-amber-300"
                  : "border-ink-100 bg-white hover:border-green-200",
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {isUrgent && <Clock className="h-3.5 w-3.5 shrink-0 text-amber-500" />}
                  <p className="truncate font-medium text-ink-800">{item.title || item.subject || item.name}</p>
                </div>
                <p className="mt-1 text-[13px] text-ink-500">{item.detail || item.region || item.owner}</p>
              </div>
              {item.status ? <TierBadge status={item.status} size="sm" /> : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
