"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";
import { useI18n } from "../../i18n/I18nProvider";

const leftConfig = [
  { key: "browseCrops", href: "/browse", popover: "browse" },
  { key: "findFarmers", href: "/find-farmers", popover: "farmers" },
  { key: "internationalExport", href: "/international", popover: "export" },
  { key: "requestQuote", href: "/request-quote", popover: "quote" },
  { key: "buyerProtection", href: "/buyer-protection", popover: "protection" },
];

const rightConfig = [
  { key: "helpCenter", href: "/help", popover: "help" },
  { key: "sellOn", href: "/sell/onboarding", popover: "sell", accent: true },
  { key: "mobileApp", href: "/mobile", popover: "mobile", accent: true },
];

function PopoverPanel({ children, className }) {
  return (
    <div
      className={cn(
        "invisible absolute left-0 top-full z-50 mt-2 w-[min(100vw-2rem,320px)] rounded-[14px] border border-ink-200 bg-white p-4 text-[13px] text-ink-700 opacity-0 shadow-lift transition-all",
        "group-hover/navitem:visible group-hover/navitem:opacity-100",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SubNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <div className="border-b border-ink-100 bg-white">
      <div className="content-shell flex min-h-[44px] flex-col gap-2 py-2 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:py-0">
        <nav aria-label="Marketplace" className="flex flex-wrap items-center gap-2 lg:gap-1">
          {leftConfig.map((item) => {
            const active = pathname === item.href;
            const p = item.popover;
            return (
              <div key={item.href} className="group/navitem relative">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "focus-ring inline-flex min-h-[42px] items-center rounded-lg border-b-2 border-transparent px-2 text-[12px] font-medium text-ink-700 transition-colors duration-200 hover:text-green-800 lg:px-3",
                    active && "border-green-800 text-green-800",
                  )}
                >
                  {t(`subnav.${item.key}`)}
                </Link>
                <PopoverPanel>
                  <p className="leading-relaxed text-ink-600">{t(`subnav.popover.${p}Hint`)}</p>
                  <div className="mt-3 flex flex-col gap-2 border-t border-ink-100 pt-3">
                    {p === "browse" ? (
                      <>
                        <Link href="/browse" className="font-semibold text-green-800 hover:underline">
                          {t("subnav.popover.browseLinkMarket")}
                        </Link>
                        <Link href="/" className="text-ink-700 hover:text-green-800">
                          {t("subnav.popover.browseLinkFeatured")}
                        </Link>
                      </>
                    ) : null}
                    {p === "farmers" ? (
                      <Link href="/find-farmers" className="font-semibold text-green-800 hover:underline">
                        {t("subnav.popover.farmersLink")}
                      </Link>
                    ) : null}
                    {p === "export" ? (
                      <>
                        <Link href="/international" className="font-semibold text-green-800 hover:underline">
                          {t("subnav.popover.exportLinkProgram")}
                        </Link>
                        <Link href="/compliance" className="text-ink-700 hover:text-green-800">
                          ONCC / MINADER compliance
                        </Link>
                        <Link href="/documentation-info" className="text-ink-700 hover:text-green-800">
                          {t("subnav.popover.exportLinkDocs")}
                        </Link>
                      </>
                    ) : null}
                    {p === "quote" ? (
                      <Link href="/request-quote" className="font-semibold text-green-800 hover:underline">
                        {t("subnav.popover.quoteLink")}
                      </Link>
                    ) : null}
                    {p === "protection" ? (
                      <Link href="/buyer-protection" className="font-semibold text-green-800 hover:underline">
                        {t("subnav.popover.protectionLink")}
                      </Link>
                    ) : null}
                  </div>
                </PopoverPanel>
              </div>
            );
          })}
        </nav>

        <nav aria-label="Support" className="flex flex-wrap items-center gap-2 lg:gap-1">
          {rightConfig.map((item) => {
            const active = pathname === item.href || (item.href === "/sell/onboarding" && pathname.startsWith("/sell"));
            const p = item.popover;
            return (
              <div key={item.key} className="group/navitem relative">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "focus-ring inline-flex min-h-[42px] items-center rounded-lg px-2 text-[12px] font-medium text-ink-700 transition-colors hover:text-green-800 lg:px-3",
                    item.accent && "font-semibold text-green-800",
                  )}
                >
                  {t(`subnav.${item.key}`)}
                </Link>
                <PopoverPanel className="right-0 left-auto">
                  <p className="leading-relaxed text-ink-600">{t(`subnav.popover.${p}Hint`)}</p>
                  <div className="mt-3 flex flex-col gap-2 border-t border-ink-100 pt-3">
                    {p === "help" ? (
                      <>
                        <Link href="/help" className="font-semibold text-green-800 hover:underline">
                          {t("subnav.popover.helpLinkSupport")}
                        </Link>
                        <Link href="/contact" className="text-ink-700 hover:text-green-800">
                          {t("subnav.popover.helpLinkContact")}
                        </Link>
                      </>
                    ) : null}
                    {p === "sell" ? (
                      <>
                        <Link href="/sell/onboarding" className="font-semibold text-gold-700 hover:underline">
                          {t("subnav.popover.sellLinkOnboard")}
                        </Link>
                        <Link href="/pricing" className="text-ink-700 hover:text-green-800">
                          {t("subnav.popover.sellLinkPricing")}
                        </Link>
                      </>
                    ) : null}
                    {p === "mobile" ? (
                      <Link href="/mobile" className="font-semibold text-green-800 hover:underline">
                        {t("subnav.popover.mobileLink")}
                      </Link>
                    ) : null}
                  </div>
                </PopoverPanel>
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
