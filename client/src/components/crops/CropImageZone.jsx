import { cn } from "../../lib/utils";

export function CropImageZone({ imageClass, className }) {
  return (
    <div
      className={cn(
        "min-h-[160px] rounded-[16px] bg-[#0D3D22]",
        imageClass,
        className,
      )}
    />
  );
}
