"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight, Check, CloudOff, ImagePlus, MapPin, PackageCheck, Sprout } from "lucide-react";
import { AudioAssistButton } from "@/components/common/AudioAssistButton";
import { ImageUploader } from "@/components/media/ImageUploader";
import {
  FarmerButton,
  FarmerHeader,
  FarmerPage,
  FarmerPanel,
} from "@/components/farmer/FarmerDesignSystem";
import { Input } from "@/components/ui/input";
import { useCreateListing } from "@/hooks/useListings";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "agriculnet.active-listing-draft.v1";

const cropOptions = [
  { name: "Cocoa", icon: "🍫", note: "Beans and pods" },
  { name: "Coffee", icon: "☕", note: "Arabica or Robusta" },
  { name: "Maize", icon: "🌽", note: "Dry or fresh grain" },
  { name: "Plantain", icon: "🍌", note: "Bunches or bulk" },
  { name: "Cassava", icon: "🌱", note: "Roots or processed" },
  { name: "Ginger", icon: "🫚", note: "Fresh or dried" },
];

const quantityPresets = [
  { label: "Bags (80kg)", unit: "bag (80kg)", helper: "Best for bagged produce" },
  { label: "Metric Tons", unit: "MT", helper: "Best for bulk supply" },
  { label: "Custom", unit: "custom", helper: "Use your own unit" },
];

const locations = [
  "Kumba, South West",
  "Bamenda, North West",
  "Sangmélima, South",
  "Bafoussam, West",
  "Bertoua, East",
  "Douala, Littoral",
  "Yaoundé, Centre",
];

const stepLabels = ["Crop", "Quantity", "Price & location", "Photos & review"];

const defaultForm = {
  crop: "",
  grade: "",
  quantity: "",
  quantityUnit: "bag (80kg)",
  customUnit: "",
  price: "",
  region: "",
  deliveryWindow: "",
  summary: "",
};

function ListingStepProgress({ step }) {
  return (
    <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm" aria-label={`Step ${step} of 4`}>
      <div className="flex items-center justify-between gap-4">
        <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-green-800">Step {step} of 4</p>
        <p className="text-[13px] font-semibold text-ink-500">{stepLabels[step - 1]}</p>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2" aria-hidden="true">
        {stepLabels.map((label, index) => (
          <span key={label} className={cn("h-2 rounded-full", index < step ? "bg-[#1E5E27]" : "bg-ink-100")} />
        ))}
      </div>
    </div>
  );
}

export default function FarmerNewListingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(defaultForm);
  const [gallery, setGallery] = useState([]);
  const [restored, setRestored] = useState(false);
  const [online, setOnline] = useState(true);
  const createListing = useCreateListing();

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setForm((current) => ({ ...current, ...(parsed.form || {}) }));
        setGallery(Array.isArray(parsed.gallery) ? parsed.gallery : []);
        setStep(Math.min(4, Math.max(1, Number(parsed.step) || 1)));
        toast.success("Your saved listing progress was restored.");
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setRestored(true);
    }
  }, []);

  useEffect(() => {
    if (!restored) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, gallery, step }));
  }, [form, gallery, restored, step]);

  useEffect(() => {
    const updateStatus = () => setOnline(window.navigator.onLine);
    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  const resolvedUnit = form.quantityUnit === "custom" ? form.customUnit.trim() : form.quantityUnit;
  const reviewRows = useMemo(() => [
    ["Crop", form.crop || "Not selected"],
    ["Grade / variety", form.grade || "Not provided"],
    ["Available", form.quantity && resolvedUnit ? `${form.quantity} ${resolvedUnit}` : "Not provided"],
    ["Target price", form.price && resolvedUnit ? `XAF ${Number(form.price).toLocaleString()} / ${resolvedUnit}` : "Not provided"],
    ["Pickup", form.region || "Not selected"],
    ["Delivery", form.deliveryWindow || "Not provided"],
  ], [form, resolvedUnit]);

  const update = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const validateStep = (currentStep) => {
    if (currentStep === 1 && !form.crop) return "Choose the crop you want to list.";
    if (currentStep === 2 && (!Number(form.quantity) || !resolvedUnit)) return "Add a valid quantity and unit.";
    if (currentStep === 3 && (!Number(form.price) || !form.region)) return "Add a valid price and pickup location.";
    if (currentStep === 4 && !gallery.length) return "Add at least one clear crop photo before publishing.";
    return null;
  };

  const goNext = () => {
    const message = validateStep(step);
    if (message) {
      toast.error(message);
      return;
    }
    setStep((current) => Math.min(4, current + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (status) => {
    if (status === "active") {
      for (let current = 1; current <= 4; current += 1) {
        const message = validateStep(current);
        if (message) {
          setStep(current);
          toast.error(message);
          return;
        }
      }
    }

    if (!online) {
      toast.error("You are offline. Your progress is saved on this device and can be published when the connection returns.");
      return;
    }

    try {
      const listing = await createListing.mutateAsync({
        cropName: form.crop || "Crop listing",
        grade: form.grade,
        quantity: Number(form.quantity || 0),
        quantityUnit: resolvedUnit || "kg",
        pricePerUnit: Number(form.price || 0),
        currency: "XAF",
        status,
        locationName: form.region,
        deliveryWindow: form.deliveryWindow,
        summary: form.summary,
        exportReady: false,
        images: gallery.map((item) => ({ url: item.url, alt: item.alt, publicId: item.publicId })),
      });
      window.localStorage.removeItem(STORAGE_KEY);
      toast.success(status === "draft" ? "Listing draft saved." : "Listing published.");
      router.push(`/farmer/listings/${listing.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Listing could not be saved. Your progress remains saved on this device.");
    }
  };

  return (
    <FarmerPage className="mx-auto max-w-5xl">
      <FarmerHeader
        title="Add New Crop Listing"
        description="Use the guided steps. Your progress saves automatically on this device when the connection drops."
        backHref="/farmer/listings"
        backLabel="Back to My Listings"
      />

      {!online ? (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] font-medium text-amber-900">
          <CloudOff className="h-5 w-5" /> Offline mode: keep editing; publishing will resume when you reconnect.
        </div>
      ) : null}

      <ListingStepProgress step={step} />

      <FarmerPanel className="mt-5" bodyClassName="p-5 sm:p-8">
        {step === 1 ? (
          <section aria-labelledby="crop-step-heading">
            <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-green-800">Crop selection</p>
            <h2 id="crop-step-heading" className="mt-2 font-display text-[30px] text-ink-950">What crop are you offering?</h2>
            <p className="mt-2 text-[14px] text-ink-500">Tap one card. You can add another listing later for a different crop.</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {cropOptions.map((crop) => {
                const selected = form.crop === crop.name;
                return (
                  <button
                    key={crop.name}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setForm((current) => ({ ...current, crop: crop.name }))}
                    className={cn(
                      "focus-ring min-h-[132px] rounded-2xl border p-4 text-left transition",
                      selected ? "border-green-700 bg-green-50 ring-2 ring-green-700/15" : "border-ink-150 bg-white hover:border-green-300",
                    )}
                  >
                    <span className="text-[32px]" aria-hidden="true">{crop.icon}</span>
                    <span className="mt-3 block text-[16px] font-bold text-ink-900">{crop.name}</span>
                    <span className="mt-1 block text-[12px] text-ink-500">{crop.note}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 grid gap-5">
              <label className="space-y-2">
                <span className="flex items-center gap-2 text-[15px] font-semibold text-ink-700">
                  Crop variety / grade
                  <AudioAssistButton text="A crop grade is your stated quality classification. Add the variety or grade you can support, and buyers can confirm it during inspection." label="Play help for crop grade" />
                </span>
                <Input value={form.grade} onChange={update("grade")} placeholder="e.g. Grade A, Trinitario, Robusta" className="h-14 rounded-lg text-[16px]" />
              </label>
              <label className="space-y-2">
                <span className="text-[15px] font-semibold text-ink-700">Short description</span>
                <textarea value={form.summary} onChange={update("summary")} maxLength={500} placeholder="Quality notes, harvest condition, and inspection details..." className="min-h-[130px] w-full rounded-lg border border-ink-200 px-4 py-3 text-[16px] outline-none focus:border-green-700 focus:ring-4 focus:ring-green-800/10" />
                <p className="text-right text-[12px] text-ink-400">{form.summary.length} / 500</p>
              </label>
            </div>
          </section>
        ) : null}

        {step === 2 ? (
          <section aria-labelledby="quantity-step-heading">
            <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-green-800">Quantity & unit</p>
            <h2 id="quantity-step-heading" className="mt-2 font-display text-[30px] text-ink-950">How much is available?</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {quantityPresets.map((preset) => {
                const selected = form.quantityUnit === preset.unit;
                return (
                  <button key={preset.unit} type="button" aria-pressed={selected} onClick={() => setForm((current) => ({ ...current, quantityUnit: preset.unit }))} className={cn("focus-ring rounded-2xl border p-4 text-left", selected ? "border-green-700 bg-green-50 ring-2 ring-green-700/15" : "border-ink-200 hover:border-green-300")}>
                    <PackageCheck className="h-6 w-6 text-green-800" />
                    <span className="mt-3 block text-[15px] font-bold text-ink-900">{preset.label}</span>
                    <span className="mt-1 block text-[12px] text-ink-500">{preset.helper}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[15px] font-semibold text-ink-700">Available quantity *</span>
                <Input inputMode="decimal" value={form.quantity} onChange={update("quantity")} placeholder="e.g. 25" className="h-14 rounded-lg text-[16px]" />
              </label>
              {form.quantityUnit === "custom" ? (
                <label className="space-y-2">
                  <span className="text-[15px] font-semibold text-ink-700">Custom unit *</span>
                  <Input value={form.customUnit} onChange={update("customUnit")} placeholder="e.g. crates, bunches" className="h-14 rounded-lg text-[16px]" />
                </label>
              ) : (
                <div className="rounded-xl bg-green-50 p-4">
                  <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-green-700">Selected unit</p>
                  <p className="mt-2 text-[18px] font-bold text-green-950">{form.quantityUnit}</p>
                </div>
              )}
            </div>
          </section>
        ) : null}

        {step === 3 ? (
          <section aria-labelledby="location-step-heading">
            <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-green-800">Pricing & location</p>
            <h2 id="location-step-heading" className="mt-2 font-display text-[30px] text-ink-950">Set the target price and pickup point</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[15px] font-semibold text-ink-700">Price per {resolvedUnit || "unit"} (XAF) *</span>
                <Input inputMode="decimal" value={form.price} onChange={update("price")} placeholder="e.g. 3200" className="h-14 rounded-lg text-[16px]" />
              </label>
              <label className="space-y-2">
                <span className="text-[15px] font-semibold text-ink-700">Delivery window</span>
                <Input value={form.deliveryWindow} onChange={update("deliveryWindow")} placeholder="Ready within 5 days" className="h-14 rounded-lg text-[16px]" />
              </label>
              <label className="space-y-2 sm:col-span-2">
                <span className="flex items-center gap-2 text-[15px] font-semibold text-ink-700"><MapPin className="h-4 w-4 text-green-800" /> Pickup location *</span>
                <select value={form.region} onChange={update("region")} className="h-14 w-full rounded-lg border border-ink-200 bg-white px-4 text-[16px] outline-none focus:border-green-700 focus:ring-4 focus:ring-green-800/10">
                  <option value="">Select the nearest market town</option>
                  {locations.map((location) => <option key={location} value={location}>{location}</option>)}
                </select>
              </label>
            </div>
          </section>
        ) : null}

        {step === 4 ? (
          <section aria-labelledby="review-step-heading">
            <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-green-800">Photos & review</p>
            <h2 id="review-step-heading" className="mt-2 font-display text-[30px] text-ink-950">Add clear photos, then review</h2>
            <div className="mt-6 rounded-xl border border-dashed border-green-200 bg-green-50/30 p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-3 text-[16px] font-bold text-ink-700"><ImagePlus className="h-5 w-5 text-green-800" /> Listing gallery</div>
              <ImageUploader value={gallery} onChange={setGallery} folder="listings" max={6} />
            </div>
            <dl className="mt-6 divide-y divide-ink-100 rounded-2xl border border-ink-150 bg-white px-4">
              {reviewRows.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-5 py-3.5">
                  <dt className="text-[13px] text-ink-500">{label}</dt>
                  <dd className="text-right text-[14px] font-bold text-ink-900">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 flex gap-2 rounded-xl bg-amber-50 p-4 text-[13px] leading-6 text-amber-900"><Sprout className="mt-0.5 h-5 w-5 shrink-0" /> AgriculNet does not mark a listing export-ready automatically. Verification and inspection remain separate checks.</p>
          </section>
        ) : null}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-ink-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <FarmerButton variant="outline" icon={ArrowLeft} onClick={() => step === 1 ? router.push("/farmer/listings") : setStep((current) => current - 1)}>
            {step === 1 ? "Cancel" : "Back"}
          </FarmerButton>
          <div className="flex flex-col gap-3 sm:flex-row">
            <FarmerButton variant="outline" disabled={createListing.isPending} onClick={() => handleSubmit("draft")}>Save Draft</FarmerButton>
            {step < 4 ? (
              <FarmerButton icon={ArrowRight} onClick={goNext}>Continue</FarmerButton>
            ) : (
              <FarmerButton icon={Check} disabled={createListing.isPending || !online} onClick={() => handleSubmit("active")}>
                {createListing.isPending ? "Publishing..." : "Publish Listing"}
              </FarmerButton>
            )}
          </div>
        </div>
      </FarmerPanel>
    </FarmerPage>
  );
}
