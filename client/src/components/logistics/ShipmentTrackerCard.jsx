"use client";

import { MapPin, Route, Truck } from "lucide-react";
import { BuyerPanel, BuyerStatusBadge, compactBuyerCurrency, formatBuyerDate } from "@/components/buyer/BuyerDesignSystem";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const projectPoints = (positions = []) => {
  const valid = positions.filter((point) => Number.isFinite(point.latitude) && Number.isFinite(point.longitude));
  if (!valid.length) return [];

  const minLat = Math.min(...valid.map((point) => point.latitude));
  const maxLat = Math.max(...valid.map((point) => point.latitude));
  const minLng = Math.min(...valid.map((point) => point.longitude));
  const maxLng = Math.max(...valid.map((point) => point.longitude));
  const latSpan = Math.max(maxLat - minLat, 0.001);
  const lngSpan = Math.max(maxLng - minLng, 0.001);

  return valid.map((point) => ({
    ...point,
    x: clamp(((point.longitude - minLng) / lngSpan) * 92 + 4, 4, 96),
    y: clamp(96 - (((point.latitude - minLat) / latSpan) * 76 + 10), 8, 92),
  }));
};

export function ShipmentTrackerCard({ shipment }) {
  if (!shipment) {
    return (
      <BuyerPanel title="Shipment tracking">
        <p className="text-[15px] text-ink-500">
          No AgriculNet shipment has been created for this order yet. Tracking appears here once logistics is assigned and dispatch begins.
        </p>
      </BuyerPanel>
    );
  }

  const points = projectPoints(shipment.positions || []);
  const latest = points[points.length - 1];
  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");
  const fallbackOrigin = { x: 12, y: 72 };
  const fallbackDestination = { x: 88, y: 24 };

  return (
    <BuyerPanel title="Shipment tracking">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-green-800">Tracking number</p>
            <p className="mt-1 text-[18px] font-bold text-green-950">{shipment.trackingNumber}</p>
          </div>
          <BuyerStatusBadge status={shipment.status}>{shipment.status.replace(/_/g, " ")}</BuyerStatusBadge>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-2xl border border-ink-200 bg-[#F5FBF6]">
            <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-400">Route map</p>
                <p className="mt-1 text-[15px] text-ink-600">{shipment.lane}</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[13px] font-semibold text-ink-600 shadow-soft">
                <Route className="h-4 w-4 text-green-800" />
                {shipment.currentLocation}
              </span>
            </div>
            <div className="relative h-[260px] bg-[radial-gradient(circle_at_top_left,_rgba(26,107,60,0.14),_transparent_35%),linear-gradient(180deg,_#F7FCF8_0%,_#EDF7F0_100%)]">
              <svg viewBox="0 0 100 100" className="h-full w-full">
                <path d="M8 78 C 22 58, 36 50, 52 52 S 74 42, 92 20" fill="none" stroke="#C8D9CD" strokeWidth="2.5" strokeDasharray="3 3" />
                {polyline ? <polyline points={polyline} fill="none" stroke="#1A6B3C" strokeWidth="2.8" /> : null}
                <circle cx={fallbackOrigin.x} cy={fallbackOrigin.y} r="4" fill="#E8B84B" />
                <circle cx={fallbackDestination.x} cy={fallbackDestination.y} r="4" fill="#1A6B3C" />
                {latest ? <circle cx={latest.x} cy={latest.y} r="4.5" fill="#0F766E" /> : null}
              </svg>
              <div className="absolute left-4 top-4 rounded-xl bg-white/95 px-3 py-2 text-[13px] text-ink-600 shadow-soft">
                <p className="font-semibold text-ink-900">Origin</p>
                <p>{[shipment.originCity, shipment.originRegion].filter(Boolean).join(", ") || "Pending"}</p>
              </div>
              <div className="absolute bottom-4 right-4 rounded-xl bg-white/95 px-3 py-2 text-[13px] text-ink-600 shadow-soft">
                <p className="font-semibold text-ink-900">Destination</p>
                <p>{[shipment.destinationCity, shipment.destinationRegion].filter(Boolean).join(", ") || "Pending"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-ink-200 bg-white p-4">
            <div className="grid gap-3">
              <div className="rounded-xl border border-ink-100 bg-ink-50 px-4 py-3">
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-400">Logistics fee</p>
                <p className="mt-1 text-[18px] font-bold text-ink-950">{shipment.logisticsFeeLabel || compactBuyerCurrency(shipment.logisticsFee)}</p>
              </div>
              <div className="rounded-xl border border-ink-100 bg-ink-50 px-4 py-3">
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-400">Estimated arrival</p>
                <p className="mt-1 text-[16px] font-semibold text-ink-900">{formatBuyerDate(shipment.estimatedArrival)}</p>
              </div>
              <div className="rounded-xl border border-ink-100 bg-ink-50 px-4 py-3">
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-400">Truck and carrier</p>
                <p className="mt-1 flex items-center gap-2 text-[16px] font-semibold text-ink-900">
                  <Truck className="h-4 w-4 text-green-800" />
                  {shipment.truck?.displayName || shipment.carrierName}
                </p>
                {shipment.truck?.plateNumber ? <p className="mt-1 text-[14px] text-ink-500">{shipment.truck.plateNumber}</p> : null}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-400">Tracking timeline</p>
          {(shipment.history || []).length ? (
            <div className="space-y-3">
              {shipment.history.map((item, index) => (
                <div key={`${item.event}-${item.date}-${index}`} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="mt-1 h-3 w-3 rounded-full bg-green-800" />
                    {index < shipment.history.length - 1 ? <span className="mt-2 h-full w-px bg-ink-200" /> : null}
                  </div>
                  <div className="flex-1 rounded-xl border border-ink-100 bg-white px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-semibold text-ink-900">{item.event}</p>
                      <BuyerStatusBadge status={item.status}>{item.status.replace(/_/g, " ")}</BuyerStatusBadge>
                    </div>
                    <p className="mt-1 text-[14px] text-ink-500">{item.location || shipment.currentLocation}</p>
                    <p className="mt-1 text-[13px] text-ink-400">{formatBuyerDate(item.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[15px] text-ink-500">Shipment updates will appear here once the truck is assigned and movement begins.</p>
          )}

          {latest ? (
            <div className="rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-[14px] text-cyan-900">
              <p className="font-semibold">Latest GPS update</p>
              <p className="mt-1 inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {latest.locationLabel || shipment.currentLocation}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </BuyerPanel>
  );
}
