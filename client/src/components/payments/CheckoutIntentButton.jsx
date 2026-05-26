"use client";

import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useCreateCheckoutIntent } from "@/hooks/usePayments";
import { useI18n } from "@/i18n/I18nProvider";

export function CheckoutIntentButton({ order, size = "sm" }) {
  const { t } = useI18n();
  const createIntent = useCreateCheckoutIntent();
  const canPay = String(order?.status || "").toLowerCase().includes("pending_payment");

  if (!canPay) return null;

  return (
    <Button
      type="button"
      variant="accent-gold"
      size={size}
      isLoading={createIntent.isPending}
      onClick={async () => {
        try {
          const intent = await createIntent.mutateAsync({ orderId: order.rawId || order.id, channel: "bank_transfer" });
          toast.success(intent?.message || t("dashboard.providerNotConfigured"));
        } catch (error) {
          toast.error(error.response?.data?.message || "Payment intent could not be prepared.");
        }
      }}
    >
      {t("common.payNow")}
    </Button>
  );
}
