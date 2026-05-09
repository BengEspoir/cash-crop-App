"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AlertTriangle, MessageCircle } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { PageHeader } from "../../../../components/common/PageHeader";
import { CropDetailGallery } from "../../../../components/crops/CropDetailGallery";
import { CropSpecsTable } from "../../../../components/crops/CropSpecsTable";
import { VerificationBadge } from "../../../../components/farmers/VerificationBadge";
import { useListing } from "../../../../hooks/useListings";
import { useStartConversation } from "../../../../hooks/useMessages";
import useAuth from "../../../../hooks/useAuth";

const UNVERIFIED_WARNING = "This seller account is not yet verified. Please proceed carefully because this profile has not completed National ID verification.";

export default function CropDetailPage({ params }) {
  const router = useRouter();
  const { user, isBuyer } = useAuth();
  const { data: listing, isLoading, error } = useListing(params.id);
  const startConversation = useStartConversation();

  const handleChat = async () => {
    if (!user) {
      toast.error("Please sign in as a buyer to start a chat.");
      router.push("/sign-in");
      return;
    }

    if (!isBuyer) {
      toast.error("Buyer accounts can start chats from public crop pages.");
      return;
    }

    if (listing?.farmerVerificationStatus !== "verified") {
      toast(UNVERIFIED_WARNING);
    }

    try {
      const result = await startConversation.mutateAsync({
        farmerId: listing.farmerId,
        listingId: listing.id,
      });
      if (result?.farmerWarning) toast(result.farmerWarning);
      router.push(`/buyer/messages/${result.conversation.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not start chat.");
    }
  };

  if (isLoading) {
    return <Card className="rounded-[16px] p-8 text-center text-ink-500">Loading crop listing...</Card>;
  }

  if (error || !listing) {
    return <Card className="rounded-[16px] p-8 text-center text-red-700">This crop listing could not be loaded.</Card>;
  }

  const specs = Array.isArray(listing.specs)
    ? listing.specs
    : Object.entries(listing.specs || {}).map(([label, value]) => ({ label, value }));

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Crop Detail"
        title={listing.crop}
        description={`${listing.quantityLabel} from ${listing.location}. Review farmer verification before starting trade.`}
        actions={(
          <>
            {listing.farmer ? (
              <Button asChild variant="outline">
                <Link href={`/farmers/${listing.farmer.id}`}>View farmer</Link>
              </Button>
            ) : null}
            <Button type="button" variant="secondary" onClick={handleChat} disabled={startConversation.isPending}>
              <MessageCircle className="h-4 w-4" /> Chat
            </Button>
            <Button asChild>
              <Link href={`/request-quote?listingId=${listing.id}`}>Request Quote</Link>
            </Button>
          </>
        )}
      />

      <Card className="rounded-[18px] p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-500">Supplier status</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="font-semibold text-ink-900">{listing.farmer?.name || "Farmer profile"}</span>
              <VerificationBadge status={listing.farmerVerificationStatus} />
            </div>
          </div>
          {listing.farmerVerificationStatus !== "verified" ? (
            <div className="flex max-w-xl gap-2 rounded-[14px] border border-gold-200 bg-gold-50 px-4 py-3 text-[12.5px] text-gold-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{UNVERIFIED_WARNING}</span>
            </div>
          ) : null}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <CropDetailGallery listing={listing} />
        <CropSpecsTable specs={specs} />
      </div>
    </section>
  );
}
