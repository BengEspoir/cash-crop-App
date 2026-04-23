"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterTabs } from "@/components/common/FilterTabs";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { demoListings } from "@/lib/demo-data";

const quoteRequests = demoListings.slice(0, 5).map((listing, index) => {
  const states = ["pending", "verified", "negotiable", "pending", "verified"];
  return {
    id: `RFQ-30${index + 1}`,
    status: states[index] ?? "pending",
    title: `${listing.crop} quote request`,
    detail: `Request built from ${listing.quantityLabel.toLowerCase()} at ${listing.location}.`,
    responseWindow: index === 0 ? "Awaiting farmer response" : "Updated within 24 hours",
    href: `/crops/${listing.id}`,
  };
});

const OPTIONS = [
  { value: "all", label: "All quotes" },
  { value: "pending", label: "Awaiting" },
  { value: "verified", label: "Confirmed" },
  { value: "negotiable", label: "Negotiable" },
];

export default function BuyerQuotesPage() {
  const [status, setStatus] = useState("all");

  const options = useMemo(() => {
    const counts = { all: quoteRequests.length };
    for (const quote of quoteRequests) {
      counts[quote.status] = (counts[quote.status] ?? 0) + 1;
    }
    return OPTIONS.map((opt) => ({ ...opt, count: counts[opt.value] ?? 0 }));
  }, []);

  const filtered = useMemo(
    () => (status === "all" ? quoteRequests : quoteRequests.filter((row) => row.status === status)),
    [status],
  );

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Buyer quotes"
        title="Open RFQs and negotiated pricing"
        description="Keep ongoing quote threads organized so response windows stay tight and farmers move fast."
        actions={
          <Button asChild>
            <Link href="/request-quote">Create RFQ</Link>
          </Button>
        }
      />

      <Reveal>
        <div className="rounded-[18px] border border-ink-100 bg-white p-4 shadow-soft">
          <FilterTabs options={options} value={status} onChange={setStatus} />
        </div>
      </Reveal>

      {filtered.length === 0 ? (
        <div className="rounded-[18px] border border-dashed border-ink-200 bg-white p-10 text-center text-ink-500">
          No quotes in this state right now.
        </div>
      ) : (
        <Stagger className="grid gap-4 xl:grid-cols-3">
          {filtered.map((quote) => (
            <StaggerItem key={quote.id}>
              <Card className="rounded-[18px] p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="section-eyebrow">{quote.id}</p>
                    <h2 className="mt-2 font-display text-[22px] text-ink-900">{quote.title}</h2>
                  </div>
                  <StatusBadge status={quote.status} />
                </div>
                <p className="mt-4 body-copy">{quote.detail}</p>
                <p className="mt-3 text-[12px] text-ink-500">{quote.responseWindow}</p>
                <Button asChild variant="outline" className="mt-5">
                  <Link href={quote.href}>Open source listing</Link>
                </Button>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </section>
  );
}
