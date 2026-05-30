"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { BuyerButton, BuyerEmptyState, BuyerPage, BuyerPanel, BuyerStatusBadge } from "@/components/buyer/BuyerDesignSystem";
import { useConfirmCheckoutIntent } from "@/hooks/usePayments";

export default function BuyerPaymentReturnPage() {
  const searchParams = useSearchParams();
  const intentId = searchParams.get("intent");
  const confirmIntent = useConfirmCheckoutIntent();
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!intentId) return;
    let active = true;

    (async () => {
      try {
        const response = await confirmIntent.mutateAsync(intentId);
        if (!active) return;
        setResult(response);
        if (response?.status === "held_in_escrow") {
          toast.success("Payment confirmed and placed in escrow.");
        } else if (response?.providerStatus === "FAILED" || response?.providerStatus === "EXPIRED") {
          toast.error("The payment was not completed.");
        }
      } catch (error) {
        if (!active) return;
        toast.error(error.response?.data?.message || "Payment status could not be refreshed.");
      }
    })();

    return () => {
      active = false;
    };
  }, [confirmIntent, intentId]);

  if (!intentId) {
    return (
      <BuyerPage>
        <BuyerEmptyState
          title="No checkout intent was provided"
          description="Return here only from the hosted payment flow."
          action={<BuyerButton href="/buyer/orders">Open buyer orders</BuyerButton>}
        />
      </BuyerPage>
    );
  }

  return (
    <BuyerPage className="mx-auto max-w-3xl">
      <BuyerPanel title="Payment return">
        {!result ? (
          <div className="space-y-3">
            <p className="text-[16px] text-ink-600">Refreshing the provider status and waiting for escrow confirmation.</p>
            <BuyerStatusBadge status="pending">Checking payment</BuyerStatusBadge>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <BuyerStatusBadge status={result.status}>{result.status.replace(/_/g, " ")}</BuyerStatusBadge>
              {result.providerStatus ? (
                <BuyerStatusBadge status={result.providerStatus === "SUCCESSFUL" ? "verified" : "pending"}>
                  Fapshi: {result.providerStatus}
                </BuyerStatusBadge>
              ) : null}
            </div>
            <p className="text-[16px] leading-7 text-ink-600">{result.message}</p>
            <div className="grid gap-3 md:grid-cols-2">
              <BuyerButton href={`/buyer/orders/${result.orderId}`} variant="gold">View order</BuyerButton>
              <BuyerButton href="/buyer/payments" variant="outline">Open payments</BuyerButton>
            </div>
            <p className="text-[13px] text-ink-400">
              If the provider confirmed payment but the order still shows pending, refresh again in a moment. AgriculNet waits for the verified webhook before finalizing escrow.
            </p>
          </div>
        )}
      </BuyerPanel>
    </BuyerPage>
  );
}
