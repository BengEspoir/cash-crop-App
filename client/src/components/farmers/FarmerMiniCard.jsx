import Link from "next/link";
import { CheckCircle2, MapPin, MessageCircle, Star } from "lucide-react";
import { Card } from "../ui/card";
import { FarmerAvatar } from "./FarmerAvatar";
import { VerificationBadge } from "./VerificationBadge";

export function FarmerMiniCard({ farmer, onChat, chatDisabled = false }) {
  const crops = [...new Set([farmer.primaryCrop, ...(farmer.cropsGrown || [])].filter(Boolean))].slice(0, 4);
  const rating = Number(farmer.rating || 0);

  return (
    <Card className="flex h-full flex-col rounded-[14px] border border-[#DDE4DE] p-5 shadow-[0_7px_24px_rgba(20,48,25,0.035)] transition hover:-translate-y-0.5 hover:border-[#AEC4B1] hover:shadow-[0_12px_34px_rgba(20,48,25,0.08)] sm:p-6">
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <FarmerAvatar initials={farmer.initials} id={farmer.id} src={farmer.avatarSrc} size="xl" />
          {farmer.verificationStatus === "verified" ? (
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#1E5E27] text-white" aria-label="Verified farmer">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="font-display text-[23px] leading-tight text-[#172019]">{farmer.name}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-[12px] text-[#6A766D]">
                <MapPin className="h-3.5 w-3.5 text-[#1E5E27]" /> {farmer.location || "Not provided"}
              </p>
            </div>
            {rating > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF8E6] px-2.5 py-1 text-[12px] font-bold text-[#765712]">
                <Star className="h-3.5 w-3.5 fill-[#E1A92A] text-[#E1A92A]" /> {rating.toFixed(1)}
              </span>
            ) : null}
          </div>
          <div className="mt-3"><VerificationBadge status={farmer.verificationStatus} /></div>
        </div>
      </div>

      <div className="mt-5 flex min-h-8 flex-wrap gap-2">
        {crops.length ? crops.map((crop) => (
          <span key={crop} className="rounded-full border border-[#D7E5D9] bg-[#F3F8F4] px-3 py-1 text-[11px] font-semibold text-[#1E5E27]">{crop}</span>
        )) : <span className="text-[12px] text-[#7B867E]">Crops not provided</span>}
      </div>

      <div className="mt-5 grid grid-cols-3 divide-x divide-[#E4E8E4] rounded-[10px] bg-[#F8FAF8] px-2 py-3 text-center">
        <div className="px-2">
          <p className="text-[12px] font-bold text-[#253229]">{farmer.harvestVolume || "Not provided"}</p>
          <p className="mt-1 text-[10px] uppercase tracking-wide text-[#808A82]">Harvest</p>
        </div>
        <div className="px-2">
          <p className="text-[12px] font-bold text-[#253229]">{farmer.reviews ? farmer.reviews : "Not provided"}</p>
          <p className="mt-1 text-[10px] uppercase tracking-wide text-[#808A82]">Reviews</p>
        </div>
        <div className="px-2">
          <p className="text-[12px] font-bold text-[#253229]">{farmer.verificationStatus === "verified" ? "Verified" : "Pending"}</p>
          <p className="mt-1 text-[10px] uppercase tracking-wide text-[#808A82]">Identity</p>
        </div>
      </div>

      {farmer.bio ? <p className="mt-4 line-clamp-2 text-[13px] leading-6 text-[#647068]">{farmer.bio}</p> : null}

      <div className="mt-auto flex gap-2 pt-5">
        <Link href={`/farmers/${farmer.id}`} className="inline-flex h-10 flex-1 items-center justify-center rounded-[9px] bg-[#1E5E27] px-4 text-[12px] font-bold text-white transition hover:bg-[#174B20]">
          View profile
        </Link>
        {onChat ? (
          <button type="button" onClick={() => onChat(farmer)} disabled={chatDisabled} className="flex h-10 w-11 items-center justify-center rounded-[9px] border border-[#BFCBC1] text-[#1E5E27] transition hover:border-[#1E5E27] hover:bg-[#F2F8F3] disabled:opacity-50" aria-label={`Chat with ${farmer.name}`}>
            <MessageCircle className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </Card>
  );
}
