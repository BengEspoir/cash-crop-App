"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AlertTriangle, CheckCircle2, MapPin, MessageCircle, Package, Star } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { FarmerAvatar } from "../../../../components/farmers/FarmerAvatar";
import { VerificationBadge } from "../../../../components/farmers/VerificationBadge";
import { CropCard } from "../../../../components/crops/CropCard";
import { SmartImage } from "../../../../components/media/SmartImage";
import { resolveListingImage } from "../../../../lib/imagery";
import { useFarmer } from "../../../../hooks/useFarmers";
import { useStartConversation } from "../../../../hooks/useMessages";
import useAuth from "../../../../hooks/useAuth";
import { getLoginRoute } from "../../../../lib/authRoutes";

const UNVERIFIED_WARNING = "This seller account is not yet verified. Please proceed carefully because this profile has not completed National ID verification.";

export default function FarmerDetailPage({ params }) {
  const router = useRouter();
  const { user, isBuyer } = useAuth();
  const { data: farmer, isLoading, error } = useFarmer(params.id);
  const startConversation = useStartConversation();

  const handleChat = async () => {
    if (!user) {
      toast.error("Please sign in as a buyer to start a chat.");
      router.push(getLoginRoute(`/farmers/${params.id}`));
      return;
    }
    if (!isBuyer) {
      toast.error("Buyer accounts can start chats from public farmer profiles.");
      return;
    }
    if (farmer.verificationStatus !== "verified") toast(UNVERIFIED_WARNING);

    try {
      const result = await startConversation.mutateAsync({ farmerId: farmer.id });
      if (result?.farmerWarning) toast(result.farmerWarning);
      router.push(`/buyer/messages/${result.conversation.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not start chat.");
    }
  };

  if (isLoading) return <Card className="rounded-[14px] p-10 text-center text-ink-500">Loading farmer profile...</Card>;
  if (error || !farmer) return <Card className="rounded-[14px] p-10 text-center text-red-700">This farmer profile could not be loaded.</Card>;

  const relatedListings = farmer.listings || [];
  const crops = [...new Set([farmer.primaryCrop, ...(farmer.cropsGrown || []), ...(farmer.cropsSold || [])].filter(Boolean))];
  const joined = farmer.joinedAt ? new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(farmer.joinedAt)) : "Not provided";
  const listingImages = relatedListings.map((listing) => ({ id: listing.id, src: resolveListingImage(listing), crop: listing.crop })).slice(0, 3);

  return (
    <section className="mx-auto max-w-[1240px] space-y-8 py-4 sm:py-8">
      <div className="overflow-hidden rounded-[18px] bg-[linear-gradient(118deg,#123B20_0%,#1E5E27_62%,#2D7338_100%)] px-6 py-9 text-white sm:px-10 lg:px-12 lg:py-12">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <FarmerAvatar initials={farmer.initials} id={farmer.id} src={farmer.avatarSrc} size="xl" />
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-white/65">Public seller profile</p>
                <VerificationBadge status={farmer.verificationStatus} className="border-white/15" />
              </div>
              <h1 className="mt-3 font-display text-[38px] leading-none sm:text-[50px]">{farmer.name}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-white/75">
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {farmer.location || "Not provided"}</span>
                {farmer.rating > 0 ? <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 fill-[#F0C45A] text-[#F0C45A]" /> {farmer.rating.toFixed(1)} ({farmer.reviews} reviews)</span> : <span>Rating not provided</span>}
                <span className="capitalize">{farmer.sellerType || "farmer"}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="border-white/40 bg-white text-[#1E5E27] hover:bg-white/90">
              <Link href="#active-listings"><Package className="h-4 w-4" /> View listings</Link>
            </Button>
            <Button type="button" onClick={handleChat} disabled={startConversation.isPending} className="bg-[#F2C35B] text-[#19351E] hover:bg-[#EAB94B]">
              <MessageCircle className="h-4 w-4" /> {startConversation.isPending ? "Opening chat..." : "Start conversation"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-7 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.55fr)]">
        <div className="space-y-8">
          <section>
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#1E5E27]">About</p>
            <h2 className="mt-2 font-display text-[30px] text-[#172019]">{farmer.farmName || farmer.businessName || "Seller profile"}</h2>
            <p className="mt-4 max-w-[760px] text-[14px] leading-7 text-[#5E6B62]">
              {farmer.bio || "This supplier has not provided a public description yet."}
            </p>
          </section>

          {listingImages.length ? (
            <section>
              <h2 className="font-display text-[27px] text-[#172019]">Available crop imagery</h2>
              <div className="mt-4 grid auto-rows-[170px] gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {listingImages.map((image, index) => (
                  <Link key={image.id} href={`/crops/${image.id}`} className={`group relative overflow-hidden rounded-[12px] bg-[#E9EEE9] ${index === 0 ? "sm:row-span-2 sm:auto-rows-auto" : ""}`}>
                    <SmartImage src={image.src} alt={image.crop} fill sizes="(min-width: 1024px) 320px, 50vw" />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-4 pb-3 pt-10 text-[12px] font-semibold text-white">{image.crop}</span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <section id="active-listings" className="scroll-mt-28">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#1E5E27]">Marketplace</p>
                <h2 className="mt-2 font-display text-[30px] text-[#172019]">Active listings</h2>
              </div>
              <span className="text-[13px] text-[#748078]">{relatedListings.length} listed</span>
            </div>
            {relatedListings.length ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {relatedListings.map((listing) => <CropCard key={listing.id} listing={listing} />)}
              </div>
            ) : <p className="mt-4 rounded-[12px] bg-[#F7F9F7] p-5 text-[14px] text-[#68736B]">This farmer has no active public listings yet.</p>}
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <Card className="rounded-[14px] border border-[#DDE5DE] p-5">
            <h2 className="font-display text-[22px] text-[#172019]">Verification summary</h2>
            <div className="mt-4"><VerificationBadge status={farmer.verificationStatus} /></div>
            {farmer.verificationStatus === "verified" ? (
              <p className="mt-4 flex gap-2 text-[13px] leading-6 text-[#315B38]"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0" /> This supplier has completed AgriculNet identity review.</p>
            ) : (
              <p className="mt-4 flex gap-2 text-[13px] leading-6 text-[#765F25]"><AlertTriangle className="mt-1 h-4 w-4 shrink-0" /> {UNVERIFIED_WARNING}</p>
            )}
          </Card>

          <Card className="rounded-[14px] border border-[#DDE5DE] p-5">
            <h2 className="font-display text-[22px] text-[#172019]">Trade capability</h2>
            <dl className="mt-4 divide-y divide-[#E7EBE7] text-[13px]">
              {[
                ["Primary crop", farmer.primaryCrop || "Not provided"],
                ["Harvest volume", farmer.harvestVolume || "Not provided"],
                ["Supplier type", farmer.sellerType || "Farmer"],
                ["Member since", joined],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <dt className="text-[#748078]">{label}</dt>
                  <dd className="text-right font-semibold capitalize text-[#263229]">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              {crops.length ? crops.map((crop) => <span key={crop} className="rounded-full bg-[#F0F7F1] px-3 py-1 text-[11px] font-semibold text-[#1E5E27]">{crop}</span>) : <span className="text-[12px] text-[#7B867E]">Additional crops not provided</span>}
            </div>
          </Card>

          <Card className="rounded-[14px] border border-[#DDE5DE] p-5">
            <h2 className="font-display text-[22px] text-[#172019]">Cooperative</h2>
            <p className="mt-3 text-[13px] leading-6 text-[#5F6D63]">{farmer.cooperativeName || "Not provided"}</p>
          </Card>
        </aside>
      </div>
    </section>
  );
}
