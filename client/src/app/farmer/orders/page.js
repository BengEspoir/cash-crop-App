"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterTabs } from "@/components/common/FilterTabs";
import { OrderCard } from "@/components/orders/OrderCard";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { demoOrders } from "@/lib/demo-data";

const OPTIONS = [
  { value: "all", label: "All orders" },
  { value: "verified", label: "Confirmed" },
  { value: "in-transit", label: "In transit" },
  { value: "pending", label: "Awaiting dispatch" },
];

export default function FarmerOrdersPage() {
  const [status, setStatus] = useState("all");

  const options = useMemo(() => {
    const counts = { all: demoOrders.length };
    for (const order of demoOrders) {
      counts[order.status] = (counts[order.status] ?? 0) + 1;
    }
    return OPTIONS.map((opt) => ({ ...opt, count: counts[opt.value] ?? 0 }));
  }, []);

  const filtered = useMemo(
    () => (status === "all" ? demoOrders : demoOrders.filter((order) => order.status === status)),
    [status],
  );

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Farmer orders"
        title="Order protection and dispatch readiness"
        description="Track buyer commitments, inspection steps, and delivery timing from the farmer side."
      />

      <Reveal>
        <div className="rounded-[18px] border border-ink-100 bg-white p-4 shadow-soft">
          <FilterTabs options={options} value={status} onChange={setStatus} />
        </div>
      </Reveal>

      {filtered.length === 0 ? (
        <div className="rounded-[18px] border border-dashed border-ink-200 bg-white p-10 text-center text-ink-500">
          No orders in this state right now.
        </div>
      ) : (
        <Stagger className="grid gap-4">
          {filtered.map((order) => (
            <StaggerItem key={order.id}>
              <OrderCard order={order} href={`/farmer/orders/${order.id}`} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </section>
  );
}
