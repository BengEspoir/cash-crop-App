import Link from "next/link";
import { MapPin, Package } from "lucide-react";
import { cn } from "../../lib/utils";
import { Card } from "../ui/card";
import { StatusBadge } from "../common/StatusBadge";
import { VerificationBadge } from "../farmers/VerificationBadge";
import { SmartImage } from "../media/SmartImage";
import { cropImagery, cropFallback } from "../../lib/imagery";

export function CropCard({ listing, href }) {
  const image = listing.imageSrc || cropImagery[listing.id] || cropFallback;
  const target = href ?? `/crops/${listing.id}`;

  return (
    <Card interactive className="group overflow-hidden rounded-[14px] p-0">
      <Link href={target} className="block">
        <div className="relative h-[180px] overflow-hidden bg-gradient-to-br from-ink-100 to-ink-200/60">
          <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.04]">
            <SmartImage
              src={image}
              alt={`${listing.crop} from ${listing.location}`}
              fill
              sizes="(min-width: 1280px) 280px, (min-width: 768px) 50vw, 100vw"
              fallbackClassName={listing.imageClass}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/10" />
          <div className="absolute inset-x-3 top-3 flex items-start justify-between">
            <StatusBadge status={listing.status} />
            {listing.grade ? (
              <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-700 backdrop-blur-sm">
                {listing.grade}
              </span>
            ) : null}
          </div>
          <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center justify-between gap-2 text-white">
            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium">
              <MapPin className="h-3.5 w-3.5" />
              {listing.location}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium">
              <Package className="h-3.5 w-3.5" />
              {listing.quantity}
            </span>
          </div>
        </div>
        <div className="space-y-2.5 p-4">
          <h3 className="text-[15px] font-semibold text-ink-800 transition-colors group-hover:text-green-800">
            {listing.crop}
          </h3>
          <VerificationBadge status={listing.farmerVerificationStatus} />
          <p className={cn("text-[12px] text-ink-500")}>{listing.deliveryWindow ?? "Ready for inspection"}</p>
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-semibold text-green-800">{listing.price}</p>
            <span className="text-[12px] font-semibold text-green-800 opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100">
              View →
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
}
