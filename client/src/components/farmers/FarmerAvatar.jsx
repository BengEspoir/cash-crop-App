export function FarmerAvatar({ initials }) {
  return (
    <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#1A6B3C] text-[16px] font-semibold text-white">
      {initials}
    </div>
  );
}
