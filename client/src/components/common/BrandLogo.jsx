import Image from "next/image";
import { cn } from "../../lib/utils";

export const BRAND_LOGO_SRC = "/images/agriculnet_logo.svg";
export const BRAND_FAVICON_SRC = "/images/agriculnet_favicon.svg";

export function BrandLogo({ className, imageClassName, priority = false }) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src={BRAND_LOGO_SRC}
        alt="AgriculNet"
        width={1600}
        height={520}
        priority={priority}
        unoptimized
        className={cn("h-auto w-full object-contain", imageClassName)}
      />
    </span>
  );
}
