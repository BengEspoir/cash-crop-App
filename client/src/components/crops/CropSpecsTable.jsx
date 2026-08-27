import { Card } from "../ui/card";
import { AudioAssistButton } from "../common/AudioAssistButton";
import { cn } from "../../lib/utils";

const getSpecAssistText = (label, value) => {
  const normalized = String(label || "").toLowerCase();
  if (normalized.includes("moisture")) {
    return `Moisture content describes how much water remains in the crop. Lower, stable moisture usually supports safer storage. This listing reports ${value || "no value yet"}.`;
  }
  if (normalized.includes("grade") || normalized.includes("quality")) {
    return `Grade is the seller's stated quality classification. Buyers should confirm it during inspection. This listing reports ${value || "no grade yet"}.`;
  }
  if (normalized.includes("quantity") || normalized.includes("weight")) {
    return `This is the amount the supplier says is available. Confirm the unit and final quantity before payment. This listing reports ${value || "no value yet"}.`;
  }
  return `${label || "This specification"} is listed as ${value || "not provided"}. Confirm technical details with the supplier through AgriculNet messaging.`;
};

export function CropSpecsTable({ specs = [], appearance = "default" }) {
  return (
    <Card className={cn("rounded-[18px] p-5", appearance === "reference" && "rounded-[14px] border-[#DDE4DE] p-0 shadow-none")}>
      <h2 className={cn("font-display text-[20px] text-[#111827]", appearance === "reference" && "px-5 pt-5 text-[26px]")}>Trade specifications</h2>
      <div className={cn("mt-4 grid gap-3 sm:grid-cols-2", appearance === "reference" && "block divide-y divide-[#E6EBE7] px-5 pb-5")}>
        {specs.length ? specs.map((spec) => (
          <div key={spec.label} className={cn("rounded-[12px] bg-[#F9FAFB] px-4 py-3", appearance === "reference" && "flex items-center justify-between gap-5 rounded-none bg-white px-0 py-3.5")}>
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">{spec.label}</p>
              <AudioAssistButton
                text={getSpecAssistText(spec.label, spec.value)}
                label={`Play explanation for ${spec.label}`}
              />
            </div>
            <p className={cn("mt-2 text-[14px] font-medium text-[#111827]", appearance === "reference" && "mt-0 text-right")}>{spec.value || "Not provided"}</p>
          </div>
        )) : <p className="py-5 text-[13px] text-[#748078]">Specifications not provided.</p>}
      </div>
    </Card>
  );
}
