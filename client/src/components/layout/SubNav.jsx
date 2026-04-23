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
  { label: "Help Center", href: "/help" },
  { label: "Sell on AgriculNet", href: "/sell" },
  { label: "Mobile App", href: "/mobile", accent: true },
];

export function SubNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-ink-100 bg-white">
      <div className="content-shell flex min-h-[42px] flex-col gap-2 py-2 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:py-0">
        <nav className="flex flex-wrap items-center gap-4 lg:gap-5">
          {leftLinks.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex min-h-[42px] items-center border-b-2 border-transparent text-[12px] font-medium text-ink-700 transition-colors duration-200 hover:text-green-800",
                  active && "border-green-800 text-green-800",
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
                "inline-flex min-h-[42px] items-center text-[12px] font-medium text-ink-700 transition-colors hover:text-green-800",
                item.accent && "text-green-800",
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
