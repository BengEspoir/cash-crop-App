"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";

const leftLinks = [
  { label: "Browse Crops", href: "/browse" },
  { label: "Find Farmers", href: "/find-farmers" },
  { label: "International Export", href: "/international" },
  { label: "Request a Quote", href: "/request-quote" },
  { label: "Buyer Protection", href: "/buyer-protection" },
];

const rightLinks = [
  { label: "Help Center", href: "/help-center" },
  { label: "Sell on AgriculNet", href: "/sell-on-agriculnet" },
  { label: "Mobile App", href: "#", accent: true },
];

export function SubNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-[#F3F4F6] bg-white shadow-sm">
      <div className="content-shell flex min-h-[56px] flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:py-0">
        <nav className="flex flex-wrap items-center gap-4 lg:gap-5">
          {leftLinks.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex min-h-[42px] items-center rounded-full px-4 py-2 text-[13px] font-medium text-[#374151] transition-all duration-200 hover:bg-[#F3F4F6] hover:text-[#1A6B3C]",
                  active && "bg-[#EAF4EE] text-[#1A6B3C] shadow-sm",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <nav className="flex flex-wrap items-center gap-4 lg:gap-5">
          {rightLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "inline-flex min-h-[42px] items-center text-[12px] font-medium text-[#374151] transition-colors hover:text-[#1A6B3C]",
                item.accent && "text-[#1A6B3C]",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
