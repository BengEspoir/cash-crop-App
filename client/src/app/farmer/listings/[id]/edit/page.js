"use client";

import { useMemo, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { PageHeader } from "@/components/common/PageHeader";
import { ImageUploader } from "@/components/media/ImageUploader";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getListingById } from "@/lib/demo-data";
import { cropImagery } from "@/lib/imagery";

export default function FarmerEditListingPage({ params }) {
  const listing = getListingById(params.id);

  if (!listing) {
    notFound();
  }

  const seedGallery = useMemo(() => {
    const url = cropImagery[listing.id];
    return url ? [{ url, alt: listing.crop, publicId: null }] : [];
  }, [listing.crop, listing.id]);

  const [form, setForm] = useState({
    crop: listing.crop,
    grade: listing.grade ?? "",
    quantity: listing.quantity,
    price: listing.price,
    deliveryWindow: listing.deliveryWindow ?? "",
    summary: listing.summary ?? "",
  });
  const [gallery, setGallery] = useState(seedGallery);

  const update = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  return (
    <section className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Farmer", href: "/farmer/dashboard" },
          { label: "Listings", href: "/farmer/listings" },
          { label: listing.crop, href: `/farmer/listings/${listing.id}` },
          { label: "Edit" },
        ]}
      />

      <PageHeader
        eyebrow="Edit listing"
        title={`Update ${listing.crop}`}
        description="Adjust trade fields, refresh photography, and keep the buyer-facing detail page accurate."
        actions={
          <Button asChild variant="outline">
            <Link href={`/farmer/listings/${listing.id}`} className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to detail
            </Link>
          </Button>
        }
      />

      <Reveal>
        <Card className="rounded-[18px] p-5 shadow-soft">
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              <div>
                <p className="section-eyebrow">Trade basics</p>
                <h2 className="mt-1 font-display text-[20px] text-ink-900">Core listing details</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-[13px] font-medium text-ink-700">Crop name</span>
                  <Input value={form.crop} onChange={update("crop")} />
                </label>
                <label className="space-y-2">
                  <span className="text-[13px] font-medium text-ink-700">Grade</span>
                  <Input value={form.grade} onChange={update("grade")} />
                </label>
                <label className="space-y-2">
                  <span className="text-[13px] font-medium text-ink-700">Quantity</span>
                  <Input value={form.quantity} onChange={update("quantity")} />
                </label>
                <label className="space-y-2">
                  <span className="text-[13px] font-medium text-ink-700">Price</span>
                  <Input value={form.price} onChange={update("price")} />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-[13px] font-medium text-ink-700">Delivery window</span>
                  <Input value={form.deliveryWindow} onChange={update("deliveryWindow")} />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-[13px] font-medium text-ink-700">Listing summary</span>
                <textarea
                  className="min-h-[140px] w-full rounded-[12px] border border-ink-200 px-4 py-3 text-[14px] outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  value={form.summary}
                  onChange={update("summary")}
                />
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <p className="section-eyebrow">Photography</p>
                <h2 className="mt-1 font-display text-[20px] text-ink-900">Listing gallery</h2>
                <p className="mt-1 text-[12.5px] text-ink-500">
                  Swap the cover or add seasonal photos. The first image becomes the listing cover.
                </p>
              </div>
              <ImageUploader
                value={gallery}
                onChange={setGallery}
                folder="agriculnet/listings"
                max={6}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-ink-100 pt-5">
            <Button type="button" variant="outline">Preview update</Button>
            <Button type="button">Save changes</Button>
          </div>
        </Card>
      </Reveal>
    </section>
  );
}
