"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useUpdateListing } from "@/hooks/useListings";

export default function FarmerListingEditPage({ params }) {
  const router = useRouter();
  const { data, isLoading } = useDashboardData("farmer");
  const updateListing = useUpdateListing();
  const listing = (data?.listings || []).find((item) => item.id === params.id);
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (listing) {
      setForm({
        cropName: listing.crop,
        quantity: listing.quantityValue || "",
        quantityUnit: listing.quantityUnit || "kg",
        pricePerUnit: listing.pricePerUnit || "",
        grade: listing.grade || "",
        locationName: listing.location || "",
        deliveryWindow: listing.deliveryWindow || "",
        summary: listing.summary || "",
        status: listing.status === "draft" ? "draft" : "active",
      });
    }
  }, [listing]);

  if (isLoading || !form) {
    return <EmptyState title="Loading live listing" description="Fetching listing details from the database." />;
  }

  if (!listing) {
    return <EmptyState title="Live listing not found" description="This listing is not connected to your farmer profile." />;
  }

  const update = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSave = async () => {
    try {
      const saved = await updateListing.mutateAsync({
        id: listing.id,
        payload: {
          ...form,
          quantity: Number(form.quantity),
          pricePerUnit: Number(form.pricePerUnit),
        },
      });
      toast.success("Listing updated.");
      router.push(`/farmer/listings/${saved.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Listing update failed.");
    }
  };

  return (
    <section className="space-y-6">
      <Breadcrumb items={[{ label: "Farmer", href: "/farmer/dashboard" }, { label: "Listings", href: "/farmer/listings" }, { label: listing.crop }]} />
      <PageHeader eyebrow="Edit listing" title={listing.crop} description="Update the real listing record buyers see in the marketplace." />

      <Card className="rounded-[18px] p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-[13px] font-medium text-ink-700">Crop name</span>
            <Input value={form.cropName} onChange={update("cropName")} />
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
            <span className="text-[13px] font-medium text-ink-700">Unit</span>
            <Input value={form.quantityUnit} onChange={update("quantityUnit")} />
          </label>
          <label className="space-y-2">
            <span className="text-[13px] font-medium text-ink-700">Price per unit</span>
            <Input value={form.pricePerUnit} onChange={update("pricePerUnit")} />
          </label>
          <label className="space-y-2">
            <span className="text-[13px] font-medium text-ink-700">Pickup region</span>
            <Input value={form.locationName} onChange={update("locationName")} />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-[13px] font-medium text-ink-700">Delivery window</span>
            <Input value={form.deliveryWindow} onChange={update("deliveryWindow")} />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-[13px] font-medium text-ink-700">Summary</span>
            <textarea
              className="min-h-[120px] w-full rounded-[12px] border border-ink-200 px-4 py-3 text-[14px] outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              value={form.summary}
              onChange={update("summary")}
            />
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <Button asChild variant="outline">
            <Link href={`/farmer/listings/${listing.id}`}>Cancel</Link>
          </Button>
          <Button type="button" onClick={handleSave} disabled={updateListing.isPending}>Save changes</Button>
        </div>
      </Card>
    </section>
  );
}
