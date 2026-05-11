import Link from "next/link";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { StatusBadge } from "../common/StatusBadge";

export function FarmerCard({ farmer }) {
  return (
    <Card interactive className="rounded-[20px] border-transparent bg-[#FFFFFF] p-[20px] shadow-[0_25px_80px_rgba(26,107,60,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#1A6B3C] text-[15px] font-semibold text-white shadow-sm">
            {farmer.initials}
          </div>
          <div className="space-y-1">
            <h3 className="text-[16px] font-semibold text-[#111827]">{farmer.name}</h3>
            <p className="text-[12px] text-[#4B5563]">{farmer.location}</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          {farmer.badges.map((badge) => (
            <StatusBadge key={badge} status={badge} />
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-[16px] bg-[#FFFFFF]/90 p-4 shadow-sm">
        {farmer.stats.map((stat) => (
          <div key={stat.label}>
            <p className="text-[16px] font-semibold text-[#1A6B3C]">{stat.value}</p>
            <p className="text-[11px] text-[#6B7280]">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {farmer.crops.map((crop) => (
          <span key={crop} className="rounded-full bg-[#F3FBF4] px-3 py-1 text-[12px] font-semibold text-[#1A6B3C]">
            {crop}
          </span>
        ))}
      </div>

      <p className="mt-4 text-[12px] text-[#475569]">
        <span className="text-[#B5892A]">★★★★★</span> {farmer.rating} ({farmer.reviews} reviews)
      </p>

      <Button asChild variant="secondary" className="mt-5 w-full">
        <Link href="/find-farmers">View Profile</Link>
      </Button>
    </Card>
  );
}
