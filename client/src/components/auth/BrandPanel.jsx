import Link from "next/link";
import Image from "next/image";
import { Globe2, ShieldCheck, Sprout, WalletCards } from "lucide-react";

const highlights = [
  { label: "Verified farmers", value: "340+", icon: ShieldCheck },
  { label: "Export-ready listings", value: "120", icon: Globe2 },
  { label: "Protected payment rails", value: "7", icon: WalletCards },
  { label: "Active crop categories", value: "18", icon: Sprout },
];

const notes = [
  "Protected flows for buyers and farmers",
  "Clear review steps before marketplace activation",
  "Built for Cameroonian supply and export trade",
];

export function BrandPanel({ eyebrow, title, subtitle }) {
  return (
    <aside className="relative h-full w-full bg-[#0D3D22] overflow-hidden">
      <Image
        src="/images/cash-crop.svg.jpg"
        alt="Cash crops from Cameroon farms"
        fill
        className="object-cover"
        priority
      />
    </aside>
  );
}

