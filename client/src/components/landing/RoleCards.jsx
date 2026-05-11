"use client";

import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { useI18n } from "../../i18n/I18nProvider";

/**
 * Optional home section: buyer onboarding only. Seller paths use bottom nav → Sell on AgriculNet.
 */
export function RoleCards() {
  const { t } = useI18n();
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <Card variant="interactive" className="group rounded-2xl border-t-[4px] border-t-gold-700 p-6">
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gold-100 text-gold-800 transition-colors duration-200 group-hover:bg-green-800 group-hover:text-white">
            <Building2 className="h-5 w-5" />
          </span>
          <Button asChild variant="cta" className="shrink-0" icon={ArrowRight} iconRight>
            <Link href="/register/buyer">{t("roleCards.buyerCta")}</Link>
          </Button>
        </div>
        <h2 className="mt-5 font-display text-[22px] leading-[1.15] text-ink-800">{t("roleCards.buyerTitle")}</h2>
        <p className="mt-3 text-[14px] leading-6 text-ink-700">{t("roleCards.buyerBody")}</p>
      </Card>
      <Card className="rounded-2xl border border-ink-200 bg-ink-50/80 p-6">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-500">{t("roleCards.sellerNoteTitle")}</p>
        <p className="mt-3 text-[14px] leading-6 text-ink-700">{t("roleCards.sellerNoteBody")}</p>
        <Link
          href="/sell/onboarding"
          className="mt-4 inline-flex items-center gap-2 text-[13px] font-semibold text-gold-700 hover:text-gold-800"
        >
          {t("roleCards.sellerCta")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>
    </section>
  );
}
