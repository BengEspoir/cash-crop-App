"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nProvider";

export function CheckoutIntentButton({ order, size = "sm" }) {
  const { t } = useI18n();
  const canPay = String(order?.status || "").toLowerCase().includes("pending_payment");

  if (!canPay) return null;

  return (
    <Button asChild type="button" variant="accent-gold" size={size}>
      <Link href={`/buyer/checkout?orderId=${order.rawId || order.id}`}>
      {t("common.payNow")}
      </Link>
    </Button>
  );
}
