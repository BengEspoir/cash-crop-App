"use client";

import { regionHighlights } from "../../constants/crops";
import { SectionHeader } from "../common/SectionHeader";
import { SmartImage } from "../media/SmartImage";
import { Reveal, Stagger, StaggerItem } from "../motion/Reveal";
import { regionImagery } from "../../lib/imagery";

function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export function RegionalSpotlight() {
  return (
    <Reveal as="section" className="space-y-5 rounded-2xl border border-ink-200 bg-white p-5 shadow-soft lg:p-6">
      <SectionHeader
        eyebrow="Regional Supply"
        title="Trade activity by region"
        description="Match crop availability with logistics priorities across Cameroon's main farming corridors and sourcing zones."
      />

      <Stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" stagger={0.08}>
        {regionHighlights.map((region) => {
          const imageSrc = regionImagery[slugify(region.name)] ?? regionImagery[region.slug];
          return (
            <StaggerItem
              key={region.name}
              className="group relative overflow-hidden rounded-2xl border border-ink-200 bg-ink-50 transition-all duration-200 hover:-translate-y-[2px] hover:shadow-glow"
            >
              <div className="relative h-[120px] w-full overflow-hidden">
                <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.06]">
                  <SmartImage
                    src={imageSrc}
                    alt={region.name}
                    fill
                    sizes="(min-width: 1280px) 260px, 50vw"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute inset-x-4 bottom-3 flex items-end justify-between">
                  <h3 className="font-display text-[18px] text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">
                    {region.name}
                  </h3>
                  <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-700 backdrop-blur-sm">
                    {region.emphasis}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-6 text-ink-700">{region.summary}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {region.crops.map((crop) => (
                    <span key={crop} className="rounded-full bg-white px-3 py-1 text-[12px] text-ink-700 border border-ink-200">
                      {crop}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-[12px] font-semibold text-green-800">{region.tradeSignal}</p>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>
    </Reveal>
  );
}
