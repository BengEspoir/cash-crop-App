"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

function pickSpec(specs, keys) {
  for (const k of keys) {
    if (specs[k] != null && String(specs[k]).trim() !== "") return String(specs[k]);
  }
  return null;
}

export function ListingCommerceDetails({ listing, className }) {
  const specs = listing?.specs && typeof listing.specs === "object" ? listing.specs : {};
  const moq = pickSpec(specs, ["moq", "MOQ", "minimumOrder"]);
  const incoterm = pickSpec(specs, ["incoterm", "Incoterm", "incoterms"]);
  const payment = pickSpec(specs, ["paymentTerms", "payment", "Payment"]);
  const warehouse = pickSpec(specs, ["warehouse", "Warehouse"]);
  const inspection = pickSpec(specs, ["inspection", "Inspection"]);

  const rows = [
    { label: "MOQ", value: moq || "Ask seller" },
    { label: "Shipment", value: listing.deliveryWindow || "Discuss with seller" },
    { label: "Location", value: listing.location },
    { label: "Volume", value: listing.quantityLabel || listing.quantity },
    { label: "Export certs", value: listing.exportReady ? "Export-ready flagged" : "Confirm with seller" },
    { label: "Logistics", value: warehouse || "Buyer / seller coordinated" },
    { label: "Inspection", value: inspection || (listing.exportReady ? "Available on request" : "On request") },
    { label: "Buyer protection", value: "Internal ledger & dispute workflow (trade rules apply)" },
    { label: "Payment", value: payment || "Agreed per quote / order" },
  ];

  return (
    <details
      className={cn(
        "group rounded-lg border border-ink-200/80 bg-ink-50/50 text-left text-[12px] text-ink-700",
        className,
      )}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 font-semibold text-ink-800 outline-none [&::-webkit-details-marker]:hidden">
        <span>Trade details</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-ink-500 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="grid gap-1.5 border-t border-ink-200/80 px-3 py-2 sm:grid-cols-2">
        {incoterm ? (
          <div className="sm:col-span-2 rounded-md bg-white/80 px-2 py-1.5 text-[11px] text-ink-600">
            <span className="font-semibold text-ink-800">Incoterms: </span>
            {incoterm}
          </div>
        ) : null}
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-0.5 rounded-md bg-white/60 px-2 py-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">{row.label}</span>
            <span className="text-[12px] text-ink-800">{row.value}</span>
          </div>
        ))}
      </div>
    </details>
  );
}
