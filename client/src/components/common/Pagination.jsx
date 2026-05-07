export function Pagination({ current = 1, total = 1 }) {
  return (
    <div className="flex items-center justify-between rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-3 text-[13px] text-[#374151]">
      <span>Page {current} of {total}</span>
      <span className="text-[#6B7280]">Pagination updates with live results</span>
    </div>
  );
}
