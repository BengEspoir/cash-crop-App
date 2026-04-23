import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card } from "../ui/card";
import { CropBadge } from "./CropBadge";
import { StatusBadge } from "../common/StatusBadge";
import { SmartImage } from "../media/SmartImage";
import { cropImagery, cropFallback } from "../../lib/imagery";

export function CropListRow({ listing, href }) {
  const image = listing.imageSrc || cropImagery[listing.id] || cropFallback;
  return (
    <Card interactive className="group overflow-hidden rounded-2xl p-0">
      <Link
        href={href ?? `/crops/${listing.id}`}
        className="flex flex-col gap-0 lg:flex-row lg:items-stretch"
      >
        <div className="relative h-[160px] w-full overflow-hidden lg:h-auto lg:w-[220px] lg:flex-shrink-0">
          <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]">
            <SmartImage
              src={image}
              alt={listing.crop}
              fill
              sizes="(min-width: 1024px) 220px, 100vw"
              fallbackClassName={listing.imageClass}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/10" />
        </div>

        <div className="flex flex-1 flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-[20px] text-ink-800">{listing.crop}</h3>
              <StatusBadge status={listing.status} />
              {listing.grade ? <CropBadge>{listing.grade}</CropBadge> : null}
            </div>
            {listing.summary ? (
              <p className="text-[13px] text-ink-700">{listing.summary}</p>
            ) : null}
            <div className="flex flex-wrap gap-4 text-[12px] text-ink-500">
              <span>{listing.quantityLabel ?? listing.quantity}</span>
              <span>{listing.location}</span>
              <span className="font-semibold text-green-800">{listing.price}</span>
            </div>
          </div>

          <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-green-800 transition-transform duration-200 group-hover:translate-x-1">
            Open listing
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </Card>
  );
}
