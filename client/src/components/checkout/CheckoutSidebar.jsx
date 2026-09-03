"use client";

import { AlertTriangle, CreditCard, ShieldCheck } from "lucide-react";
import {
  BuyerButton,
  BuyerPanel,
  compactBuyerCurrency,
} from "@/components/buyer/BuyerDesignSystem";
import { MediaAvatar } from "@/components/media/Avatar";
import { PAYMENT_METHODS } from "@/components/checkout/checkoutConfig";

function SellerSummary({ seller }) {
  return (
    <BuyerPanel title="Seller summary">
      <div className="flex items-center gap-4">
        <MediaAvatar
          src={seller?.avatarSrc}
          alt={seller?.name || "Seller"}
          initials={(seller?.name || "AG").slice(0, 2).toUpperCase()}
          size="lg"
          className="h-16 w-16 text-[20px]"
        />
        <div>
          <h2 className="font-display text-[22px] text-ink-950">
            {seller?.name || "Verified supplier"}
          </h2>
          <p className="text-[15px] text-ink-500">
            {seller?.contactName || seller?.location || "Cameroon"}
          </p>
        </div>
      </div>
      <div className="mt-5 space-y-3 rounded-2xl border border-ink-100 bg-ink-50 p-4">
        <p className="flex items-start gap-3 text-[14px] text-ink-600">
          <ShieldCheck className="mt-0.5 h-4 w-4 text-green-800" />
          Payment is recorded as protected and held until delivery, buyer receipt, seller eligibility, and dispute checks are complete.
        </p>
        <p className="flex items-start gap-3 text-[14px] text-ink-600">
          <CreditCard className="mt-0.5 h-4 w-4 text-green-800" />
          Fapshi checkout lets the buyer choose MTN MoMo or Orange Money on the hosted payment page.
        </p>
      </div>
    </BuyerPanel>
  );
}

function CheckoutSummary({ amounts, channel, isPreparing, onCheckout, order }) {
  const paymentLabel = PAYMENT_METHODS.find((item) => item.value === channel)?.label || "MTN MoMo";

  return (
    <BuyerPanel title="Checkout summary">
      <div className="space-y-4 text-[15px] text-ink-600">
        <div className="flex items-center justify-between gap-4">
          <span>Goods subtotal</span>
          <span className="font-semibold text-ink-950">
            {compactBuyerCurrency(amounts.baseAmount)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Logistics fee</span>
          <span className="font-semibold text-ink-950">
            {compactBuyerCurrency(amounts.logisticsFee)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Platform commission</span>
          <span className="font-semibold text-ink-950">
            {compactBuyerCurrency(amounts.platformCommission)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Seller net payout</span>
          <span className="font-semibold text-ink-950">
            {compactBuyerCurrency(amounts.sellerNetAmount)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Payment channel</span>
          <span className="font-semibold text-ink-950">{paymentLabel}</span>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-ink-100 pt-4">
          <span className="font-semibold text-ink-900">Buyer total</span>
          <span className="font-display text-[24px] text-green-900">
            {compactBuyerCurrency(amounts.totalAmount)}
          </span>
        </div>
        <div className="rounded-2xl border border-gold-200 bg-gold-50 px-4 py-3 text-[14px] text-gold-900">
          <p className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            Do not close the browser immediately after paying. AgriculNet waits for the Fapshi webhook before confirming the payment.
          </p>
        </div>
        <BuyerButton
          type="button"
          variant="gold"
          className="w-full"
          disabled={isPreparing}
          onClick={onCheckout}
        >
          {isPreparing ? "Preparing checkout..." : "Continue to protected payment"}
        </BuyerButton>
        <BuyerButton
          href={order ? `/buyer/orders/${order.rawId || order.id}` : "/browse"}
          variant="outline"
          className="w-full"
        >
          {order ? "Back to order" : "Return to marketplace"}
        </BuyerButton>
      </div>
    </BuyerPanel>
  );
}

export function CheckoutSidebar(props) {
  return (
    <div className="space-y-6">
      <SellerSummary seller={props.seller} />
      <CheckoutSummary {...props} />
    </div>
  );
}
