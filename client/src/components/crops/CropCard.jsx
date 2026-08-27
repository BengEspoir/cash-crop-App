import Link from "next/link";
import { MapPin, Package } from "lucide-react";
import { InquiryHeat } from "../common/SellerTrustBar";
import { SmartImage } from "../media/SmartImage";
import { resolveListingImage } from "../../lib/imagery";
import { ListingBodyTrustRibbon } from "./ListingTrustRibbon";
import { ListingCommerceDetails } from "./ListingCommerceDetails";
import { AdminSupportLink } from "../common/AdminSupportLink";

export function CropCard({ listing, href }) {
  const image = resolveListingImage(listing);
  const target = href ?? `/crops/${listing.id}`;
  const [priceAmount, priceUnit] = String(listing.price || "Price on request").split("/");

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-ink-100 bg-white p-4 shadow-[0_18px_50px_rgba(20,39,29,0.10)] transition-all duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_24px_60px_rgba(20,39,29,0.16)]">
      <Link href={target} className="block">
        <div className="relative h-[260px] overflow-hidden rounded-[20px] bg-gradient-to-br from-ink-100 to-ink-200/60">
          <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.04]">
            <SmartImage
              src={image}
              alt={`${listing.crop} from ${listing.location}`}
              fill
              sizes="(min-width: 1280px) 360px, (min-width: 768px) 50vw, 100vw"
              fallbackClassName={listing.imageClass}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
          <div className="absolute inset-x-5 bottom-5 space-y-3 text-white">
            <span className="flex items-center gap-2 text-[15px] font-semibold">
              <MapPin className="h-5 w-5" />
              {listing.location || "Location not provided"}
            </span>
            <span className="flex items-center gap-2 text-[15px] font-semibold">
              <Package className="h-5 w-5" />
              {listing.quantityLabel || listing.quantity || "Quantity not provided"}
            </span>
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-7">
        <div className="flex items-start justify-between gap-4">
          <Link href={target} className="min-w-0">
            <h3 className="font-display text-[28px] font-semibold leading-tight text-ink-900 transition-colors group-hover:text-green-800">
              {listing.crop || "Crop listing"}
            </h3>
          </Link>
          <div className="shrink-0">
            <InquiryHeat viewCount={listing.viewCount} inquiryCount={listing.inquiryCount} />
          </div>
        </div>

        <div className="mt-4">
          <ListingBodyTrustRibbon listing={listing} />
        </div>

        <p className="mt-7 text-[18px] text-ink-500">
          {listing.deliveryWindow ?? "Ready for inspection"}
        </p>

        <ListingCommerceDetails
          listing={listing}
          className="mt-6 rounded-[14px] bg-white text-[14px] [&_summary]:min-h-14 [&_summary]:px-5 [&_summary]:py-3 [&_summary]:text-[16px]"
        />

        <p className="mt-7 text-[28px] font-bold tracking-tight text-green-800">
          {priceAmount.trim()}
          {priceUnit ? (
            <span className="ml-2 text-[17px] font-semibold text-ink-400">/ {priceUnit.trim()}</span>
          ) : null}
        </p>

        <Link
          href={target}
          className="mt-5 inline-flex min-h-14 w-full items-center justify-center rounded-[14px] bg-[#1E5E27] px-5 text-[17px] font-bold text-white shadow-[0_12px_24px_rgba(30,94,39,0.18)] transition-colors hover:bg-green-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-800/20"
        >
          Send inquiry
        </Link>
        <AdminSupportLink listingId={listing.id} compact className="mt-2 w-full" />
      </div>
    </article>
  );
}
