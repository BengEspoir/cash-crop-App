"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Check, ImagePlus } from "lucide-react";
import { ImageUploader } from "@/components/media/ImageUploader";
import {
  FarmerButton,
  FarmerHeader,
  FarmerPage,
  FarmerPanel,
} from "@/components/farmer/FarmerDesignSystem";
import { Input } from "@/components/ui/input";
import { useCreateListing } from "@/hooks/useListings";

const defaultForm = {
  crop: "Cocoa",
  grade: "",
  quantity: "",
  quantityUnit: "kg",
  price: "",
  region: "",
  deliveryWindow: "",
  summary: "",
};

const steps = ["Crop Details", "Pricing & Quantity", "Photos & Location"];

export default function FarmerNewListingPage() {
  const router = useRouter();
  const [form, setForm] = useState(defaultForm);
  const [gallery, setGallery] = useState([]);
  const createListing = useCreateListing();

  const update = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (status) => {
    try {
      const listing = await createListing.mutateAsync({
        cropName: form.crop,
        grade: form.grade,
        quantity: Number(form.quantity || 0),
        quantityUnit: form.quantityUnit || "kg",
        pricePerUnit: Number(form.price || 0),
        currency: "XAF",
        status,
        locationName: form.region,
        deliveryWindow: form.deliveryWindow,
        summary: form.summary,
        exportReady: true,
        images: gallery.map((item) => ({ url: item.url, alt: item.alt, publicId: item.publicId })),
      });
      toast.success(status === "draft" ? "Listing draft saved." : "Listing published.");
      router.push(`/farmer/listings/${listing.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Listing could not be saved.");
    }
  };

  return (
    <FarmerPage className="mx-auto max-w-5xl">
      <FarmerHeader
        title="Add New Crop Listing"
        description="Fill in your crop details and submit the listing for marketplace review."
        backHref="/farmer/listings"
        backLabel="Back to My Listings"
      />

      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-start gap-4">
        {steps.map((step, index) => (
          <div key={step} className="contents">
            <div className="text-center">
              <span className={`mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border-4 text-[18px] font-bold ${index === 0 ? "border-green-800 bg-green-800 text-white" : "border-ink-200 bg-white text-ink-400"}`}>
                {index === 0 ? <Check className="h-5 w-5" /> : index + 1}
              </span>
              <p className={`mt-3 text-[15px] font-bold ${index === 0 ? "text-green-800" : "text-ink-400"}`}>{step}</p>
            </div>
            {index < steps.length - 1 ? <div className="mt-6 h-px bg-ink-200" /> : null}
          </div>
        ))}
      </div>

      <FarmerPanel>
        <div className="space-y-8">
          <div>
            <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-ink-400">Crop Information</p>
            <div className="mt-5 grid gap-5">
              <label className="space-y-2">
                <span className="text-[15px] font-semibold text-ink-700">Crop Category *</span>
                <Input value={form.crop} onChange={update("crop")} className="h-16 rounded-lg text-[16px]" />
              </label>
              <label className="space-y-2">
                <span className="text-[15px] font-semibold text-ink-700">Crop Variety / Grade *</span>
                <Input value={form.grade} onChange={update("grade")} placeholder="e.g. Grade A, Trinitario, Robusta" className="h-16 rounded-lg text-[16px]" />
                <p className="text-[14px] text-ink-400">Be specific. This helps buyers find your exact crop.</p>
              </label>
              <label className="space-y-2">
                <span className="text-[15px] font-semibold text-ink-700">Crop Description</span>
                <textarea
                  value={form.summary}
                  onChange={update("summary")}
                  maxLength={500}
                  placeholder="Describe your crop, quality notes, how it was grown, and special characteristics..."
                  className="min-h-[150px] w-full rounded-lg border border-ink-200 px-5 py-4 text-[16px] outline-none focus:border-green-700 focus:ring-4 focus:ring-green-800/10"
                />
                <p className="text-right text-[14px] text-ink-400">{form.summary.length} / 500</p>
              </label>
            </div>
          </div>

          <div>
            <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-ink-400">Pricing & Quantity</p>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[15px] font-semibold text-ink-700">Available Quantity *</span>
                <Input value={form.quantity} onChange={update("quantity")} placeholder="2000" className="h-16 rounded-lg text-[16px]" />
              </label>
              <label className="space-y-2">
                <span className="text-[15px] font-semibold text-ink-700">Unit</span>
                <Input value={form.quantityUnit} onChange={update("quantityUnit")} className="h-16 rounded-lg text-[16px]" />
              </label>
              <label className="space-y-2">
                <span className="text-[15px] font-semibold text-ink-700">Price per unit (XAF) *</span>
                <Input value={form.price} onChange={update("price")} placeholder="2100" className="h-16 rounded-lg text-[16px]" />
              </label>
              <label className="space-y-2">
                <span className="text-[15px] font-semibold text-ink-700">Delivery Window</span>
                <Input value={form.deliveryWindow} onChange={update("deliveryWindow")} placeholder="Ready within 5 days" className="h-16 rounded-lg text-[16px]" />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-[15px] font-semibold text-ink-700">Pickup Location</span>
                <Input value={form.region} onChange={update("region")} placeholder="Kumba, South West" className="h-16 rounded-lg text-[16px]" />
              </label>
            </div>
          </div>

          <div>
            <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-ink-400">Photos & Location</p>
            <div className="mt-5 rounded-xl border border-dashed border-ink-200 p-5">
              <div className="mb-4 flex items-center gap-3 text-[16px] font-bold text-ink-700">
                <ImagePlus className="h-5 w-5 text-green-800" />
                Listing Gallery
              </div>
              <ImageUploader value={gallery} onChange={setGallery} folder="agriculnet/listings" max={6} />
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-6">
          <FarmerButton href="/farmer/listings" variant="outline" icon={ArrowLeft}>Cancel</FarmerButton>
          <div className="flex flex-wrap gap-3">
            <FarmerButton variant="outline" disabled={createListing.isPending} onClick={() => handleSubmit("draft")}>Save Draft</FarmerButton>
            <FarmerButton disabled={createListing.isPending} onClick={() => handleSubmit("active")}>
              {createListing.isPending ? "Publishing..." : "Publish Listing"}
            </FarmerButton>
          </div>
        </div>
      </FarmerPanel>
    </FarmerPage>
  );
}
