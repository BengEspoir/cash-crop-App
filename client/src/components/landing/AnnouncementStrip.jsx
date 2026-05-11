import Link from "next/link";

export function AnnouncementStrip() {
  return (
    <div className="content-shell pt-4 lg:pt-6">
      <div className="flex flex-col gap-3 rounded-[16px] border border-transparent bg-[#FFF9EE] px-5 py-4 shadow-[0_20px_70px_rgba(139,92,246,0.1)] lg:flex-row lg:items-center lg:justify-between animate-fade-in">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex rounded-full bg-[#F59E0B] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-sm">
            New harvest listings
          </span>
          <p className="max-w-2xl text-[13px] text-[#374151]">
            Verified farmer supply for cocoa, coffee, maize, cassava, and export crops is live this week.
          </p>
        </div>
        <Link href="/browse" className="inline-flex items-center rounded-full bg-[#1A6B3C] px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#225a38]">
          View latest listings
        </Link>
      </div>
    </div>
  );
}
