"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Card } from "../ui/card";
import { SmartImage } from "../media/SmartImage";
import { resolveListingImage, cropImageByKeyword } from "../../lib/imagery";
import { cn } from "../../lib/utils";

function resolveGalleryImages(listing) {
  if (Array.isArray(listing.images) && listing.images.length) {
    return listing.images;
  }
  const main = resolveListingImage(listing);
  const neighbours = [...new Set(Object.values(cropImageByKeyword))].filter((src) => src !== main).slice(0, 3);
  return [main, ...neighbours].slice(0, 4);
}

export function CropDetailGallery({ listing }) {
  const images = resolveGalleryImages(listing);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!lightboxOpen) return undefined;
    const handler = (event) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowRight") setActiveIndex((idx) => (idx + 1) % images.length);
      if (event.key === "ArrowLeft") setActiveIndex((idx) => (idx - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen, images.length]);

  const active = images[activeIndex] ?? images[0];

  return (
    <>
      <Card className="overflow-hidden rounded-[18px]">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="group relative block h-[280px] w-full overflow-hidden bg-ink-100 focus-ring"
          aria-label="Open gallery"
        >
          <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03]">
            <SmartImage
              src={active}
              alt={listing.crop}
              fill
              priority
              sizes="(min-width: 1024px) 680px, 100vw"
              fallbackClassName={listing.imageClass}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
          <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            {activeIndex + 1} / {images.length}
          </span>
        </button>

        {images.length > 1 ? (
          <div className="grid grid-cols-4 gap-2 border-t border-ink-200 bg-ink-50 p-3">
            {images.map((src, idx) => (
              <button
                type="button"
                key={`${src}-${idx}`}
                onClick={() => setActiveIndex(idx)}
                className={cn(
                  "relative h-16 overflow-hidden rounded-lg border transition-all duration-200 focus-ring",
                  idx === activeIndex
                    ? "border-green-800 ring-2 ring-green-800/25"
                    : "border-ink-200 hover:border-green-800/60",
                )}
                aria-label={`View image ${idx + 1}`}
              >
                <SmartImage
                  src={src}
                  alt=""
                  fill
                  sizes="160px"
                  fallbackClassName={listing.imageClass}
                />
              </button>
            ))}
          </div>
        ) : null}

        <div className="p-5">
          <p className="section-eyebrow">Listing Visual</p>
          <h2 className="mt-2 font-display text-[22px] text-ink-800">{listing.crop}</h2>
          <p className="mt-2 body-copy">{listing.summary}</p>
        </div>
      </Card>

      {lightboxOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 animate-fade-in"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white backdrop-blur-md transition hover:bg-white/25 focus-ring"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative max-h-[80vh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-[70vh] w-full overflow-hidden rounded-2xl">
              <SmartImage
                src={active}
                alt={listing.crop}
                fill
                sizes="100vw"
                className="object-contain"
                fallbackClassName={listing.imageClass}
              />
            </div>
            {images.length > 1 ? (
              <div className="mt-4 flex justify-center gap-2">
                {images.map((src, idx) => (
                  <button
                    type="button"
                    key={`lb-${src}-${idx}`}
                    onClick={() => setActiveIndex(idx)}
                    className={cn(
                      "h-12 w-20 overflow-hidden rounded-lg border transition-all focus-ring",
                      idx === activeIndex ? "border-gold-400 ring-2 ring-gold-400/40" : "border-white/25 hover:border-white/60",
                    )}
                  >
                    <SmartImage src={src} alt="" fill sizes="120px" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
