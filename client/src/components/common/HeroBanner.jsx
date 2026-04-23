import Link from "next/link";
import { SmartImage } from "../media/SmartImage";
import { Button } from "../ui/button";
import { Reveal } from "../motion/Reveal";
import { cn } from "../../lib/utils";

export function HeroBanner({
  eyebrow,
  title,
  description,
  image,
  primaryAction,
  secondaryAction,
  align = "left",
  className,
}) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden rounded-[22px] border border-ink-200 bg-green-900 text-white shadow-soft",
        className,
      )}
    >
      <div className="absolute inset-0 -z-10">
        {image?.src ? (
          <div className="absolute inset-0 animate-ken-burns motion-reduce:animate-none">
            <SmartImage
              src={image.src}
              alt={image.alt ?? ""}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,61,34,0.72)_0%,rgba(13,61,34,0.55)_50%,rgba(13,61,34,0.9)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_100%_0%,rgba(232,184,75,0.22),transparent_55%)]" />
      </div>

      <Reveal
        as="div"
        inView={false}
        y={8}
        className={cn(
          "flex flex-col gap-4 px-6 py-10 sm:px-8 sm:py-12 lg:py-16",
          align === "center" && "items-center text-center",
        )}
      >
        {eyebrow ? (
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="font-display text-[30px] leading-[1.08] sm:text-[36px] lg:text-[44px] max-w-3xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-[15px] leading-7 text-white/85">{description}</p>
        ) : null}
        {(primaryAction || secondaryAction) ? (
          <div className="mt-2 flex flex-wrap gap-3">
            {primaryAction ? (
              <Button asChild className="bg-gold-400 text-ink-900 hover:bg-gold-300">
                <Link href={primaryAction.href}>{primaryAction.label}</Link>
              </Button>
            ) : null}
            {secondaryAction ? (
              <Button asChild variant="outline" className="border-white/40 bg-white/10 text-white backdrop-blur-md hover:bg-white/20">
                <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
              </Button>
            ) : null}
          </div>
        ) : null}
      </Reveal>
    </section>
  );
}
