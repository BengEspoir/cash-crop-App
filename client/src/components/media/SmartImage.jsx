"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "../../lib/utils";
import { buildCldUrl, hasCloudinary } from "../../lib/cloudinary";

/**
 * Project-wide image wrapper.
 *
 * - If `src` starts with "http", it is used as-is (e.g. Unsplash curated URL).
 * - Otherwise, if Cloudinary is configured, `src` is treated as a Cloudinary
 *   publicId and a delivery URL is built with transformations.
 * - If no `src` is available, a branded gradient fallback is rendered so the
 *   layout never collapses.
 *
 * Accepts either `fill` (for container-driven sizing) or explicit `width` +
 * `height` (for intrinsic sizing).
 */
export function SmartImage({
  src,
  alt = "",
  fill,
  width,
  height,
  sizes,
  className,
  wrapperClassName,
  priority,
  transformOptions,
  fallbackClassName,
  objectPosition,
  ...rest
}) {
  const [errored, setErrored] = useState(false);

  const computedSrc = (() => {
    if (!src) return null;
    if (/^https?:\/\//.test(src)) return src;
    if (hasCloudinary) return buildCldUrl(src, transformOptions);
    return null;
  })();

  if (!computedSrc || errored) {
    return (
      <div
        aria-hidden={alt ? undefined : true}
        className={cn(
          "bg-[linear-gradient(135deg,#0D3D22,#2E8B57)]",
          fill ? "absolute inset-0" : "h-full w-full",
          fallbackClassName,
          wrapperClassName,
        )}
      />
    );
  }

  if (fill) {
    return (
      <div className={cn("relative h-full w-full overflow-hidden", wrapperClassName)}>
        <Image
          src={computedSrc}
          alt={alt}
          fill
          sizes={sizes ?? "(min-width: 1024px) 50vw, 100vw"}
          priority={priority}
          className={cn("object-cover", className)}
          style={objectPosition ? { objectPosition } : undefined}
          onError={() => setErrored(true)}
          {...rest}
        />
      </div>
    );
  }

  return (
    <Image
      src={computedSrc}
      alt={alt}
      width={width ?? 1200}
      height={height ?? 800}
      sizes={sizes}
      priority={priority}
      className={className}
      style={objectPosition ? { objectPosition } : undefined}
      onError={() => setErrored(true)}
      {...rest}
    />
  );
}
