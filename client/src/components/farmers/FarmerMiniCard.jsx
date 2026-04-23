import Link from "next/link";
import { Card } from "../ui/card";
import { FarmerAvatar } from "./FarmerAvatar";
import { VerificationBadge } from "./VerificationBadge";

export function FarmerMiniCard({ farmer }) {
  return (
    <Card className="rounded-2xl p-5">
      <div className="flex items-start gap-4">
        <FarmerAvatar initials={farmer.initials} id={farmer.id} src={farmer.avatarSrc} />
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-display text-[20px] text-ink-800">{farmer.name}</h3>
            <VerificationBadge status={farmer.verificationStatus} />
          </div>
          <p className="text-[13px] text-ink-500">{farmer.location}</p>
          {farmer.bio ? <p className="text-[13px] leading-6 text-ink-700">{farmer.bio}</p> : null}
          <Link
            href={`/farmers/${farmer.id}`}
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-green-800 hover:text-green-700"
          >
            View farmer profile →
          </Link>
        </div>
      </div>
    </Card>
  );
}
