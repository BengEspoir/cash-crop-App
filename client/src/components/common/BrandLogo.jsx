"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "../../lib/utils";
import { LOGO_TRANSPARENT_SRC } from "../../lib/imagery";
import { BRAND_LOGO_SRC, BRAND_FAVICON_SRC } from "../../lib/brandAssets";

export { BRAND_LOGO_SRC, BRAND_FAVICON_SRC };

export function BrandLogo({ className, imageClassName, priority = false }) {
  const [src, setSrc] = useState(LOGO_TRANSPARENT_SRC || BRAND_LOGO_SRC);

  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src={src}
        alt="AgriculNet"
        width={640}
        height={200}
        priority={priority}
        unoptimized
        onError={() => setSrc(BRAND_LOGO_SRC)}
        className={cn("h-auto w-full max-h-14 object-contain object-left", imageClassName)}
      />
    </span>
  );
}
