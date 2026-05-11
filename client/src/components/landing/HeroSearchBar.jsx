import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "../ui/button";

const filters = ["Verified only", "Export-ready", "Negotiable", "Bulk orders", "New arrivals"];

export function HeroSearchBar() {
  return (
    <section className="space-y-4 rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-sm animate-fade-in">
      <div className="flex flex-col gap-3 rounded-[9999px] border border-[#E5E7EB] bg-[#F8FAFB] p-3 shadow-sm lg:flex-row lg:items-center">
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-3 text-[13px] font-semibold text-[#1A6B3C] shadow-sm lg:min-w-[180px]">
          <span>All categories</span>
        </div>
        <div className="flex flex-1 items-center gap-3 px-2">
          <Search className="h-4 w-4 text-[#1A6B3C]" />
          <input
            type="search"
            placeholder="Search by crop, region, farmer, or cooperative"
            className="h-11 w-full border-0 bg-transparent p-0 text-[15px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
          />
        </div>
        <Button className="rounded-full bg-[#1A6B3C] px-6 text-white hover:bg-[#225a38]">Search Listings</Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#EAF4EE] px-3 py-1.5 text-[12px] font-semibold text-[#1A6B3C]">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
        </span>
        {filters.map((filter) => (
          <span key={filter} className="rounded-full bg-[#F3F8F3] px-3 py-1.5 text-[12px] font-medium text-[#1A6B3C]">
            {filter}
          </span>
        ))}
      </div>
    </section>
  );
}
