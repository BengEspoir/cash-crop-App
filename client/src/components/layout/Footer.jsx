"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Mail } from "lucide-react";
import { BrandLogo } from "../common/BrandLogo";
import { useI18n } from "../../i18n/I18nProvider";

export function Footer() {
  const { t } = useI18n();

  const columns = useMemo(
    () => [
      {
        titleKey: "footer.marketplace",
        items: [
          { labelKey: "footer.browseCrops", href: "/browse" },
          { labelKey: "footer.findFarmers", href: "/find-farmers" },
          { labelKey: "footer.buyerProtection", href: "/buyer-protection" },
          { labelKey: "footer.requestQuote", href: "/request-quote" },
        ],
      },
      {
        titleKey: "footer.forSellers",
        items: [
          { labelKey: "footer.sellOn", href: "/sell/onboarding" },
          { labelKey: "footer.farmerVerification", href: "/verification" },
          { labelKey: "footer.tradeSupport", href: "/trade-support" },
          { labelKey: "footer.pricing", href: "/pricing" },
          { labelKey: "footer.inspections", href: "/inspections-info" },
        ],
      },
      {
        titleKey: "footer.forBuyers",
        items: [
          { labelKey: "footer.exportProgram", href: "/international" },
          { labelKey: "footer.protectedOrders", href: "/buyer-protection" },
          { label: "Compliance standards", href: "/compliance" },
          { labelKey: "footer.logistics", href: "/logistics-info" },
          { labelKey: "footer.documentation", href: "/documentation-info" },
        ],
      },
      {
        titleKey: "footer.support",
        items: [
          { labelKey: "common.aboutUs", href: "/about" },
          { labelKey: "footer.helpCenter", href: "/help" },
          { labelKey: "footer.terms", href: "/terms" },
          { labelKey: "footer.privacy", href: "/privacy" },
          { labelKey: "footer.contactTeam", href: "/contact" },
        ],
      },
    ],
    [],
  );

  return (
    <footer className="relative mt-16 overflow-hidden bg-[#071A12] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(900px_320px_at_20%_0%,rgba(232,184,75,0.14),transparent_60%),radial-gradient(900px_420px_at_80%_40%,rgba(46,139,87,0.22),transparent_60%)]" />
      <div className="content-shell grid gap-10 py-12 lg:grid-cols-[1.15fr_repeat(4,1fr)]">
        <div className="space-y-5">
          <Link href="/" className="inline-flex rounded-[12px] bg-white px-3 py-2 shadow-soft">
            <BrandLogo className="h-11 w-[168px]" />
          </Link>
          <p className="max-w-sm text-[14px] leading-6 text-white/80">{t("footer.tagline")}</p>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/60">{t("footer.newsletter")}</p>
            <p className="mt-2 text-[13px] leading-6 text-white/80">{t("footer.newsletterBody")}</p>
            <form className="mt-3 flex flex-col gap-2 sm:flex-row">
              <label className="sr-only" htmlFor="newsletterEmail">
                {t("common.email")}
              </label>
              <input
                id="newsletterEmail"
                type="email"
                placeholder={t("footer.newsletterPlaceholder")}
                className="h-11 w-full rounded-[12px] border border-white/10 bg-white/10 px-4 text-[13px] text-white outline-none placeholder:text-white/45 focus:border-gold-400/60"
              />
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-[12px] bg-gold-400 px-5 text-[13px] font-semibold text-[#1A1A1A] shadow-[0_8px_26px_rgba(232,184,75,0.25)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-gold-300"
              >
                {t("common.subscribe")}
              </button>
            </form>
            <p className="mt-2 text-[11.5px] text-white/55">{t("footer.newsletterFine")}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/contact"
              className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/10 bg-white/5 text-white/80 transition-colors hover:bg-white/10 hover:text-gold-100"
              aria-label={t("footer.contactTeam")}
            >
              <Mail className="h-4 w-4" />
            </Link>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/10 bg-white/5 text-white/80 transition-colors hover:bg-white/10 hover:text-gold-100"
              aria-label="LinkedIn"
            >
              <span className="text-[11px] font-bold">in</span>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/10 bg-white/5 text-white/80 transition-colors hover:bg-white/10 hover:text-gold-100"
              aria-label="X"
            >
              <span className="text-[11px] font-bold">X</span>
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/10 bg-white/5 text-white/80 transition-colors hover:bg-white/10 hover:text-gold-100"
              aria-label="Facebook"
            >
              <span className="text-[11px] font-bold">f</span>
            </a>
          </div>
        </div>

        {columns.map((column) => (
          <div key={column.titleKey}>
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/60">{t(column.titleKey)}</p>
            <ul className="space-y-2.5 text-[13px] text-white/80">
              {column.items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="focus-ring rounded-sm transition-colors duration-200 hover:text-gold-300">
                    {item.labelKey ? t(item.labelKey) : item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="content-shell flex flex-col items-start justify-between gap-3 py-5 text-[12px] text-white/55 lg:flex-row lg:items-center">
          <p>{t("footerBottom.copyright", { year: new Date().getFullYear() })}</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/terms" className="focus-ring rounded-sm hover:text-gold-300">
              {t("footerBottom.terms")}
            </Link>
            <Link href="/privacy" className="focus-ring rounded-sm hover:text-gold-300">
              {t("footerBottom.privacy")}
            </Link>
            <Link href="/contact" className="focus-ring rounded-sm hover:text-gold-300">
              {t("footerBottom.contact")}
            </Link>
            <Link href="/about" className="focus-ring rounded-sm hover:text-gold-300">
              {t("common.aboutUs")}
            </Link>
            <Link href="/sell/onboarding" className="focus-ring rounded-sm hover:text-gold-300">
              {t("footerBottom.sell")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
