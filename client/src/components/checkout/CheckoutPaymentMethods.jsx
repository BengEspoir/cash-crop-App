"use client";

import {
  BuyerPanel,
  BuyerStatusBadge,
} from "@/components/buyer/BuyerDesignSystem";
import { PAYMENT_METHODS } from "@/components/checkout/checkoutConfig";

export function CheckoutPaymentMethods({ channel, onSelect }) {
  return (
    <BuyerPanel title="Payment method">
      <div className="grid gap-4">
        {PAYMENT_METHODS.map((method) => {
          const active = channel === method.value;

          return (
            <button
              key={method.value}
              type="button"
              onClick={() => onSelect(method.value)}
              className={`rounded-2xl border p-5 text-left transition-all ${active ? "border-green-800 bg-green-50 shadow-soft" : "border-ink-200 bg-white hover:border-green-200"}`}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-display text-[22px] text-ink-950">{method.label}</p>
                  <p className="mt-1 text-[15px] text-ink-500">{method.detail}</p>
                </div>
                <BuyerStatusBadge status={active ? "verified" : "pending"}>
                  {active ? "Selected" : method.badge}
                </BuyerStatusBadge>
              </div>
            </button>
          );
        })}
      </div>
    </BuyerPanel>
  );
}
