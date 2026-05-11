import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { OrderStatusBadge } from "./OrderStatusBadge";

export function OrderCard({ order, href }) {
  return (
    <Card variant="interactive" className="rounded-[16px] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-400">{order.id}</p>
          <h3 className="mt-2 font-display text-[20px] text-ink-900">{order.crop}</h3>
          <p className="mt-2 text-[13px] text-ink-600">{`${order.quantity} - ${order.amountLabel}`}</p>
          {order.notes && <p className="mt-1 text-[13px] text-ink-400">{order.notes}</p>}
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button asChild variant="cta" size="sm" icon={ArrowRight} iconRight>
          <Link href={href}>View order</Link>
        </Button>
      </div>
    </Card>
  );
}
