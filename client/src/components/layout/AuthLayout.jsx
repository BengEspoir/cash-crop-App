"use client";

import Link from "next/link";
import { PageTransition } from "../motion/PageTransition";
import { BrandLogo } from "../common/BrandLogo";
import { SmartImage } from "../media/SmartImage";
import { resolveAuthBackground } from "../../lib/imagery";
import { cn } from "../../lib/utils";

export function AuthLayout({ children }) {
  const image = resolveAuthBackground();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        {image?.src ? (
          <SmartImage
            src={image.src}
            alt={image.alt ?? ""}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : null}
        <div
          className={cn(
            "absolute inset-0 bg-[linear-gradient(120deg,rgba(13,61,34,0.88)_0%,rgba(13,61,34,0.72)_50%,rgba(13,61,34,0.55)_100%)]",
          )}
        />
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_20%_0%,rgba(232,184,75,0.2),transparent_55%)]" />
      </div>

      <div className="content-shell flex min-h-screen flex-col items-center justify-center py-8 lg:py-12">
        <PageTransition className="w-full max-w-[560px] space-y-6">
          <div className="flex justify-center">
            <Link
              href="/"
              className="focus-ring inline-flex rounded-[12px] bg-white/95 px-3 py-2 shadow-lift backdrop-blur-sm"
            >
              <BrandLogo className="h-12 w-[168px]" priority />
            </Link>
          </div>
          <div className="rounded-[22px] border border-white/20 bg-white/95 p-1 shadow-lift backdrop-blur-md">
            <div className="rounded-[20px] bg-white px-4 py-6 sm:px-6 sm:py-8">{children}</div>
          </div>
        </PageTransition>
      </div>
    </div>
  );
}
