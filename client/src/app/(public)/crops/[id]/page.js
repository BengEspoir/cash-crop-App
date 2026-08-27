"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AlertTriangle, MapPin, Package, ShoppingCart, Truck } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { CropDetailGallery } from "../../../../components/crops/CropDetailGallery";
import { CropSpecsTable } from "../../../../components/crops/CropSpecsTable";
import { CropCard } from "../../../../components/crops/CropCard";
import { SupplierMessageDialog } from "../../../../components/crops/SupplierMessageDialog";
import { AdminSupportLink } from "../../../../components/common/AdminSupportLink";
import { FarmerAvatar } from "../../../../components/farmers/FarmerAvatar";
import { VerificationBadge } from "../../../../components/farmers/VerificationBadge";
import { useListing, useListings } from "../../../../hooks/useListings";
import useAuth from "../../../../hooks/useAuth";
import { getLoginRoute } from "../../../../lib/authRoutes";
import { useCartStore } from "../../../../store/cartStore";

const UNVERIFIED_WARNING = "This seller account is not yet verified. Please proceed carefully because this profile has not completed National ID verification.";

export default function CropDetailPage({ params }) {
  const router = useRouter();
  const { user, isBuyer } = useAuth();
  const { data: listing, isLoading, error } = useListing(params.id);
  const { listings: candidateListings } = useListings({ query: listing?.crop || "", limit: 6 });
  const setListing = useCartStore((state) => state.setListing);

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please sign in as a buyer to continue to checkout.");
      router.push(getLoginRoute(`/crops/${params.id}`));
      return;
    }
    if (!isBuyer) {
      toast.error("Only buyer accounts can checkout from public crop pages.");
      return;
    }
    setListing(listing);
    router.push(`/buyer/checkout?listingId=${listing.id}`);
  };

  if (isLoading) return <Card className="rounded-[14px] p-10 text-center text-ink-500">Loading crop listing...</Card>;
  if (error || !listing) return <Card className="rounded-[14px] p-10 text-center text-red-700">This crop listing could not be loaded.</Card>;

  const seller = listing.seller || listing.farmer;
  const specs = Array.isArray(listing.specs)
    ? listing.specs
    : Object.entries(listing.specs || {}).map(([label, value]) => ({ label, value }));
  const relatedListings = candidateListings.filter((item) => item.id !== listing.id).slice(0, 3);

  return (
    <section className="mx-auto max-w-[1240px] space-y-10 py-4 sm:py-8">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_370px]">
        <CropDetailGallery listing={listing} showCaption={false} appearance="reference" />

        <aside className="space-y-4 lg:sticky lg:top-28">
          <Card className="rounded-[14px] border border-[#D9E1DA] p-6 shadow-[0_12px_34px_rgba(20,48,25,0.07)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#718077]">Target price</p>
            <p className="mt-2 font-display text-[34px] leading-none text-[#1E5E27]">{listing.price || "Not provided"}</p>
            <dl className="mt-6 divide-y divide-[#E6EBE7] text-[13px]">
              <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
                <dt className="flex items-center gap-2 text-[#708078]"><Package className="h-4 w-4" /> Available</dt>
                <dd className="text-right font-semibold text-[#27332A]">{listing.quantity || "Not provided"}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="flex items-center gap-2 text-[#708078]"><Truck className="h-4 w-4" /> Delivery</dt>
                <dd className="text-right font-semibold text-[#27332A]">{listing.deliveryWindow || "Not provided"}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="flex items-center gap-2 text-[#708078]"><MapPin className="h-4 w-4" /> Location</dt>
                <dd className="text-right font-semibold text-[#27332A]">{listing.location || "Not provided"}</dd>
              </div>
            </dl>

            <div className="mt-5 border-t border-[#E6EBE7] pt-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#718077]">Seller</p>
              <div className="mt-3 flex items-center gap-3">
                <FarmerAvatar initials={seller?.initials} id={seller?.id} src={seller?.avatarSrc} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-bold text-[#253128]">{seller?.name || "Not provided"}</p>
                  <div className="mt-1"><VerificationBadge status={listing.farmerVerificationStatus} /></div>
                </div>
              </div>
              {seller?.id ? <Link href={`/farmers/${seller.id}`} className="mt-3 inline-block text-[12px] font-semibold text-[#1E5E27] hover:underline">View seller profile</Link> : null}
            </div>

            <div className="mt-6 space-y-2.5">
              <SupplierMessageDialog listing={listing} />
              <Button asChild variant="outline" className="h-11 w-full"><Link href={`/request-quote?listingId=${listing.id}`}>Request a quote</Link></Button>
              <div className="grid grid-cols-2 gap-2.5">
                <Button type="button" variant="outline" onClick={handleAddToCart}><ShoppingCart className="h-4 w-4" /> Checkout</Button>
                <AdminSupportLink listingId={listing.id} compact />
              </div>
            </div>
          </Card>
        </aside>
      </div>

      <article className="max-w-[850px]">
        <p className="text-[12px] font-bold uppercase tracking-[0.17em] text-[#1E5E27]">Crop listing</p>
        <h1 className="mt-3 font-display text-[42px] leading-[1.08] text-[#172019] sm:text-[54px]">{listing.crop}</h1>
        <p className="mt-5 text-[15px] leading-8 text-[#5D6A61]">{listing.description || listing.summary || "Description not provided."}</p>
      </article>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_370px]">
        <CropSpecsTable specs={specs} appearance="reference" />
        <Card className="rounded-[14px] border border-[#E7D7A8] bg-[#FFF9EA] p-5 shadow-none">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#8A6B1F]" />
            <div>
              <h2 className="text-[14px] font-bold text-[#58491F]">Review seller verification</h2>
              <p className="mt-2 text-[12.5px] leading-6 text-[#715F2D]">
                {listing.farmerVerificationStatus === "verified"
                  ? "This supplier has completed AgriculNet identity review. Continue to review the listing terms before paying."
                  : UNVERIFIED_WARNING}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#1E5E27]">More marketplace supply</p>
            <h2 className="mt-2 font-display text-[32px] text-[#172019]">Related listings</h2>
          </div>
          <Link href="/browse" className="text-[13px] font-semibold text-[#1E5E27] hover:underline">Browse all crops</Link>
        </div>
        {relatedListings.length ? (
          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {relatedListings.map((item) => <CropCard key={item.id} listing={item} />)}
          </div>
        ) : <p className="mt-4 rounded-[12px] bg-[#F7F9F7] p-5 text-[14px] text-[#68736B]">No related listings are available yet.</p>}
      </section>
    </section>
  );
}
