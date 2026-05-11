import { regionHighlights } from "../../constants/crops";
import { SectionHeader } from "../common/SectionHeader";

export function RegionalSpotlight() {
  return (
    <section className="space-y-5 rounded-[20px] border border-transparent bg-[#FFFFFF] p-5 shadow-[0_30px_90px_rgba(136,112,43,0.08)] lg:p-6 animate-fade-in">
      <SectionHeader
        eyebrow="Regional Supply"
        title="Trade activity by region"
        description="Match crop availability with logistics priorities across Cameroon&apos;s main farming corridors and sourcing zones."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {regionHighlights.map((region, index) => (
          <div
            key={region.name}
            className={`rounded-[18px] p-5 shadow-sm ${
              index % 2 === 0
                ? "bg-[#EAF4EE]"
                : "bg-[#FFF1D1]"
            } animate-slide-up`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">{region.emphasis}</p>
            <h3 className="mt-3 text-[16px] font-semibold text-[#111827]">{region.name}</h3>
            <p className="mt-3 text-[14px] leading-7 text-[#374151]">{region.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {region.crops.map((crop) => (
                <span key={crop} className="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-[#1A6B3C] shadow-sm">
                  {crop}
                </span>
              ))}
            </div>
            <p className="mt-4 text-[12px] font-semibold text-[#B5892A]">{region.tradeSignal}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
