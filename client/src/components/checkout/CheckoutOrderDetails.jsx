"use client";

import { MapPin, ShoppingCart } from "lucide-react";
import {
  BuyerPanel,
  BuyerStatusBadge,
  compactBuyerCurrency,
} from "@/components/buyer/BuyerDesignSystem";
import { VerificationBadge } from "@/components/farmers/VerificationBadge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { regions } from "@/constants/regions";

export function CheckoutOrderDetails({
  activeListing,
  form,
  logisticsEstimate,
  onFieldChange,
  onToggleLogistics,
  order,
  originCity,
  seller,
  totalAmount,
}) {
  return (
    <BuyerPanel title="Order details">
      <div className="flex flex-col gap-5 rounded-2xl border border-green-200 bg-green-50/60 p-5 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-800 text-white">
              <ShoppingCart className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-[24px] text-green-950">
                {order?.crop || activeListing?.crop}
              </h2>
              <p className="text-[15px] text-green-900/75">
                {order?.amountLabel || activeListing?.price}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {seller?.verificationStatus ? (
              <VerificationBadge status={seller.verificationStatus} />
            ) : null}
            {activeListing?.exportReady || order?.seller?.exportReady ? (
              <BuyerStatusBadge status="verified">Export-ready</BuyerStatusBadge>
            ) : null}
          </div>
          <p className="inline-flex items-center gap-2 text-[15px] text-ink-600">
            <MapPin className="h-4 w-4" />
            {seller?.location || activeListing?.location || "Cameroon"}
          </p>
        </div>
        <div className="rounded-2xl border border-green-200 bg-white px-4 py-3 text-right shadow-soft">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-400">
            Protected amount
          </p>
          <p className="mt-2 font-display text-[28px] text-green-900">
            {compactBuyerCurrency(totalAmount)}
          </p>
        </div>
      </div>

      {!order ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-400">
              Quantity
            </span>
            <Input
              type="number"
              min="1"
              value={form.quantity}
              onChange={onFieldChange("quantity")}
              className="h-12"
            />
          </label>
          <label className="space-y-2">
            <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-400">
              Unit
            </span>
            <Input
              value={form.quantityUnit}
              readOnly
              aria-readonly="true"
              className="h-12"
            />
          </label>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4">
        <div className="rounded-2xl border border-ink-200 bg-ink-50 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-400">
                AgriculNet logistics
              </p>
              <h3 className="mt-2 font-display text-[22px] text-ink-950">
                Tracked truck delivery
              </h3>
              <p className="mt-2 text-[15px] text-ink-500">
                Add AgriculNet transport to track the truck from pickup through warehouse arrival.
              </p>
            </div>
            {!order ? (
              <button
                type="button"
                onClick={onToggleLogistics}
                className={`inline-flex h-12 items-center rounded-full px-5 text-[14px] font-semibold transition ${form.logisticsRequired ? "bg-green-800 text-white" : "border border-ink-200 bg-white text-ink-700"}`}
              >
                {form.logisticsRequired ? "Logistics selected" : "Add logistics"}
              </button>
            ) : (
              <BuyerStatusBadge status={order.logisticsRequired ? "verified" : "pending"}>
                {order.logisticsRequired ? "Logistics enabled" : "Buyer pickup"}
              </BuyerStatusBadge>
            )}
          </div>

          {form.logisticsRequired || order?.logisticsRequired ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-400">
                  Destination region
                </span>
                <select
                  value={form.destinationRegion}
                  onChange={onFieldChange("destinationRegion")}
                  className="h-12 w-full rounded-lg border border-ink-200 bg-white px-4 text-[15px] text-ink-900"
                  disabled={Boolean(order)}
                >
                  <option value="">Select destination region</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-400">
                  Destination city
                </span>
                <Input
                  value={form.destinationCity}
                  onChange={onFieldChange("destinationCity")}
                  placeholder="Douala, Yaounde, Bafoussam..."
                  className="h-12"
                  disabled={Boolean(order)}
                />
              </label>
              <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-[14px] text-cyan-900 md:col-span-2">
                <p className="font-semibold">
                  {logisticsEstimate?.matched || order?.logisticsRequired
                    ? "Tracked route available"
                    : "Awaiting route estimate"}
                </p>
                <p className="mt-1">
                  {order?.logisticsRequired
                    ? `Lane: ${order.metadata?.originCity || originCity || "Origin"} to ${order.metadata?.destinationCity || form.destinationCity || "Destination"}`
                    : logisticsEstimate?.message || logisticsEstimate?.lane || "Pick a destination region to estimate AgriculNet logistics."}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <label className="space-y-2">
          <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-400">
            Shipping address
          </span>
          <Textarea
            rows={3}
            value={form.shippingAddress}
            onChange={onFieldChange("shippingAddress")}
            placeholder="Delivery address or receiving warehouse"
          />
        </label>
        <label className="space-y-2">
          <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-400">
            Billing address
          </span>
          <Textarea
            rows={2}
            value={form.billingAddress}
            onChange={onFieldChange("billingAddress")}
            placeholder="Optional billing address"
          />
        </label>
        <label className="space-y-2">
          <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-400">
            Order notes
          </span>
          <Textarea
            rows={4}
            value={form.notes}
            onChange={onFieldChange("notes")}
            placeholder="Packing, dispatch, invoice, or inspection notes"
          />
        </label>
      </div>
    </BuyerPanel>
  );
}
