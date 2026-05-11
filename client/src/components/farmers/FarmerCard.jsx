import Link from "next/link";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { TierBadge } from "../ui/badge";
import { SellerTrustBar } from "../common/SellerTrustBar";
import { CountUp } from "../motion/CountUp";
import { MediaAvatar } from "../media/Avatar";
import { farmerAvatars } from "../../lib/imagery";

export function FarmerCard({ farmer }) {
  const avatar = farmer.avatarSrc || farmerAvatars[farmer.id];
  const href = farmer.id ? `/farmers/${farmer.id}` : "/find-farmers";

  return (
    <Card variant="interactive" className="group rounded-[14px] p-[18px]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <MediaAvatar
            src={avatar}
            alt={farmer.name}
            initials={farmer.initials}
            size="md"
            className="ring-2 ring-white shadow-soft transition-transform duration-200 group-hover:scale-[1.03]"
          />
          <div className="space-y-1">
            <h3 className="text-[15px] font-semibold text-ink-800">{farmer.name}</h3>
            <p className="text-[12px] text-ink-500">{farmer.location}</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          <SellerTrustBar
            rating={farmer.rating}
            reviewCount={farmer.reviews}
            verified={farmer.verified}
            exportReady={farmer.exportReady}
            totalListings={farmer.totalListings}
            totalSales={farmer.totalSales}
            size="sm"
            compact
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-[12px] bg-ink-50 p-3">
        {farmer.stats?.map((stat) => (
          <div key={stat.label}>
            <p className="text-[16px] font-semibold text-green-800">
              {typeof stat.value === "number" ? (
                <CountUp end={stat.value} suffix={stat.suffix || ""} />
              ) : (
                stat.value
              )}
            </p>
            <p className="text-[11px] text-ink-500">{stat.label}</p>
          </div>
        )) || (
          <>
            <div>
              <p className="text-[16px] font-semibold text-green-800">
                <CountUp end={farmer.totalListings || 0} />
              </p>
              <p className="text-[11px] text-ink-500">Listings</p>
            </div>
            <div>
              <p className="text-[16px] font-semibold text-green-800">
                <CountUp end={farmer.totalSales || 0} />
              </p>
              <p className="text-[11px] text-ink-500">Sales</p>
            </div>
          </>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {farmer.crops?.map((crop) => (
          <span key={crop} className="rounded-full bg-green-100 px-3 py-1 text-[12px] font-medium text-green-800">
            {crop}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <SellerTrustBar
          rating={farmer.rating}
          reviewCount={farmer.reviews}
          verified={farmer.verified}
          exportReady={farmer.exportReady}
          totalListings={farmer.totalListings}
          totalSales={farmer.totalSales}
          size="sm"
        />
      </div>

      <Button asChild variant="cta" size="sm" className="mt-4 w-full">
        <Link href={href}>View Profile</Link>
      </Button>
    </Card>
  );
}
