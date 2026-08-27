import { cropSearchOptions } from "../../lib/cropSearch";

export function CategorySidebar({ activeCategory, counts, onSelect }) {
  return (
    <aside className="rounded-[14px] border border-[#E5E7EB] bg-white p-5">
      <h3 className="font-display text-[20px] text-[#111827]">Browse by crop</h3>
      <p className="mt-2 text-[13px] leading-5 text-ink-500">
        Filter the recent listings shown beside this menu.
      </p>
      <div className="mt-5 space-y-2">
        {cropSearchOptions.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelect(category)}
              aria-pressed={isActive}
              className={`flex w-full items-center justify-between rounded-[8px] px-3 py-2 text-left text-[13px] font-medium ${
                isActive
                  ? "bg-[#EAF4EE] text-[#1A6B3C]"
                  : "bg-[#F9FAFB] text-[#374151] hover:bg-[#F3F4F6]"
              }`}
            >
              <span>{category}</span>
              <span className="text-[11px] text-[#6B7280]">{counts[category] ?? 0}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
