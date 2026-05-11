"use client";

import Link from "next/link";
import { MessageSquarePlus, ShoppingBag } from "lucide-react";
import { cn } from "../../lib/utils";
import { useI18n } from "../../i18n/I18nProvider";

const dockPrimary =
  "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[10px] border-transparent bg-green-800 px-3 text-[13px] font-semibold text-white shadow-[0_4px_14px_rgba(26,107,60,0.35)] transition-all duration-200 ease-out hover:bg-green-700 hover:shadow-[0_6px_20px_rgba(26,107,60,0.45)] hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-800/15 motion-reduce:hover:translate-y-0";

const dockSecondary =
  "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[10px] border border-ink-300 bg-white px-3 text-[13px] font-semibold text-ink-700 transition-all duration-200 hover:border-gold-400 hover:bg-gold-50 hover:text-gold-900 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold-400/25";

/**
 * Thumb-zone dock for marketplace browse — quick RFQ + seller onboarding entry.
 */
export function MobileMarketplaceDock() {
  const { t } = useI18n();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 md:hidden" aria-hidden={false}>
      <div className="pointer-events-auto border-t border-ink-200 bg-white/95 px-3 py-2.5 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-md [padding-bottom:max(0.5rem,env(safe-area-inset-bottom))]">
        <div className={cn("mx-auto flex w-full max-w-none gap-2 px-1")}>
          <Link href="/request-quote" className={dockPrimary}>
            <MessageSquarePlus className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
            {t("mobileDock.rfq")}
          </Link>
          <Link href="/sell/onboarding" className={dockSecondary}>
            <ShoppingBag className="h-4 w-4 shrink-0" />
            {t("mobileDock.listSupply")}
          </Link>
        </div>
      </div>
    </div>
  );
}
