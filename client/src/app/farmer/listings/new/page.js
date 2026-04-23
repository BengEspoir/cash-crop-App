"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { PageHeader } from "@/components/common/PageHeader";
import { ImageUploader } from "@/components/media/ImageUploader";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const defaultForm = {
  crop: "Cocoa Beans",
  grade: "Export Grade A",
  quantity: "2,000 kg",
  price: "XAF 1,650 / kg",
  region: "Kumba, South West",
  deliveryWindow: "Ready within 5 days",
  summary:
    "Sun-dried cocoa prepared for warehouse pickup with moisture checks already completed.",
};

export default function FarmerNewListingPage() {
  const [form, setForm] = useState(defaultForm);
  const [gallery, setGallery] = useState([]);

  const update = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  return (
    <section className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Farmer", href: "/farmer/dashboard" },
          { label: "Listings", href: "/farmer/listings" },
          { label: "Create" },
        ]}
      />

      <PageHeader
        eyebrow="Create listing"
        title="Draft a new crop offer"
        description="Add photography and trade fields now so buyers get an export-ready presentation the moment it's published."
        actions={
          <Button asChild variant="outline">
            <Link href="/farmer/listings" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to listings
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
                  <span className="text-[13px] font-medium text-ink-700">Available quantity</span>
                  <Input value={form.quantity} onChange={update("quantity")} />
                </label>
                <label className="space-y-2">
                  <span className="text-[13px] font-medium text-ink-700">Price</span>
                  <Input value={form.price} onChange={update("price")} />
                </label>
                <label className="space-y-2">
                  <span className="text-[13px] font-medium text-ink-700">Pickup region</span>
                  <Input value={form.region} onChange={update("region")} />
                </label>
                <label className="space-y-2">
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
                  Up to 6 photos. The first becomes the cover used on search cards, detail pages, and
                  buyer shortlists.
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
            <Button type="button" variant="outline">Save draft</Button>
            <Button type="button">Publish listing</Button>
          </div>
        </Card>
      </Reveal>
    </section>
  );
}
