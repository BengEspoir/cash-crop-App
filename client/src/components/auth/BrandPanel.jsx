"use client";

import Link from "next/link";
import { BrandLogo } from "../common/BrandLogo";
import { SmartImage } from "../media/SmartImage";
import { Reveal } from "../motion/Reveal";

const defaultPills = [
  "Verified marketplace",
  "Cameroon-focused trade",
  "Protected account flows",
];

export function BrandPanel({
  title,
  subtitle,
  image,
  variant = "signin",
  pills = defaultPills,
}) {
  const isRegistration = variant === "registration";

  return (
    <aside className="relative isolate flex min-h-[210px] overflow-hidden bg-[#164D24] text-white lg:h-screen lg:min-h-[720px]">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {image?.src ? (
          <div className="absolute inset-0 animate-ken-burns motion-reduce:animate-none">
            <SmartImage
              src={image.src}
              alt={image.alt ?? ""}
              fill
              priority
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-cover"
            />
          </div>
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(30,94,39,0.72)_0%,rgba(30,94,39,0.75)_46%,rgba(17,72,31,0.92)_100%)]" />
      </div>

      <div className={isRegistration
        ? "flex h-full w-full items-center justify-center px-6 py-8 lg:px-16"
        : "flex h-full w-full flex-col justify-between px-6 py-7 sm:px-10 lg:px-16 lg:py-16"}
      >
        <Reveal inView={false} delay={0.05}>
          <Link
            href="/"
            className="inline-flex rounded-[26px] bg-white px-6 py-5 shadow-[0_16px_38px_rgba(0,0,0,0.18)] lg:px-8 lg:py-6"
          >
            <BrandLogo className="h-12 w-[190px] lg:h-14 lg:w-[230px]" priority />
          </Link>
        </Reveal>

        {!isRegistration ? (
          <Reveal inView={false} delay={0.15} className="hidden max-w-[470px] space-y-5 lg:block">
            <h1 className="font-display text-[46px] font-bold leading-[1.03] tracking-[-0.025em] text-[#E7B940]">
              {title}
            </h1>
            <p className="max-w-[46ch] text-[16px] leading-7 text-white/90">{subtitle}</p>
            <div className="flex flex-wrap gap-2.5 pt-2">
              {pills.map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-[#F0C856]/55 bg-[#B98918]/80 px-3.5 py-2 text-[12px] font-semibold text-white shadow-sm backdrop-blur-sm"
                >
                  {pill}
                </span>
              ))}
            </div>
          </Reveal>
        ) : null}
      </div>
    </aside>
  );
}
