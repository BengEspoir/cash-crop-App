"use client";

import Link from "next/link";
import { Bot, PackageSearch, Tractor, Warehouse } from "lucide-react";
import { cn } from "@/lib/utils";

export function MarketplaceSearchNav({ active = "products" }) {
  const normalizedActive = (() => {
    if (!active || active === "all") return "";
    if (active === "farmer" || active === "farmers") return "farmers";
    if (active === "reseller" || active === "resellers") return "resellers";
    if (active === "products") return "products";
    return active;
  })();

  const items = [
    { id: "products", label: "Products", href: "/browse", icon: PackageSearch },
    { id: "farmers", label: "Farmers", href: "/find-farmers?type=farmer", icon: Tractor },
    { id: "resellers", label: "Resellers", href: "/find-farmers?type=reseller", icon: Warehouse },
  ];

  return (
    <nav aria-label="Marketplace discovery" className="flex flex-wrap items-center gap-2">
      {items.map(({ id, label, href, icon: Icon }) => {
        const isCurrent = normalizedActive === id;
        return (
          <Link
            key={id}
            href={href}
            aria-current={isCurrent ? "page" : undefined}
            className={cn(
              "focus-ring inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[13px] font-bold transition-colors",
              isCurrent
                ? "border-green-800 bg-green-800 text-white shadow-sm"
                : "border-ink-200 bg-white text-ink-700 hover:border-green-300 hover:text-green-900"
            )}
          >
            <Icon className="h-4 w-4" /> {label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent("agriculnet:open-assistant", { detail: { prompt: "Help me source an agricultural product." } }))}
        className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-full border border-gold-300 bg-gold-50 px-4 text-[13px] font-bold text-gold-900 transition-colors hover:bg-gold-100"
      >
        <Bot className="h-4 w-4" /> Ask AgriculNet AI
      </button>
    </nav>
  );
}
