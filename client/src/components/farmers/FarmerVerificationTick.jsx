import Image from "next/image";

export function FarmerVerificationTick({ className = "h-5 w-5", label = "Verified farmer" }) {
  return (
    <Image
      src="/Last-images/veriefied%20tick.png"
      alt={label}
      width={24}
      height={24}
      className={className}
    />
  );
}
