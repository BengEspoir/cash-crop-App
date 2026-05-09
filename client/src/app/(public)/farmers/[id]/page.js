"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AlertTriangle, MessageCircle } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { PageHeader } from "../../../../components/common/PageHeader";
import { FarmerMiniCard } from "../../../../components/farmers/FarmerMiniCard";
import { VerificationBadge } from "../../../../components/farmers/VerificationBadge";
import { CropCard } from "../../../../components/crops/CropCard";
import { useFarmer } from "../../../../hooks/useFarmers";
import { useStartConversation } from "../../../../hooks/useMessages";
import useAuth from "../../../../hooks/useAuth";

const UNVERIFIED_WARNING = "This seller account is not yet verified. Please proceed carefully because this profile has not completed National ID verification.";

export default function FarmerDetailPage({ params }) {
  const router = useRouter();
  const { user, isBuyer } = useAuth();
  const { data: farmer, isLoading, error } = useFarmer(params.id);
  const startConversation = useStartConversation();

  const handleChat = async () => {
    if (!user) {
      toast.error("Please sign in as a buyer to start a chat.");
      router.push("/sign-in");
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

  if (isLoading) {
    return <Card className="rounded-[16px] p-8 text-center text-ink-500">Loading farmer profile...</Card>;
  }

  if (error || !farmer) {
    return <Card className="rounded-[16px] p-8 text-center text-red-700">This farmer profile could not be loaded.</Card>;
  }

  const relatedListings = farmer.listings || [];

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Farmer Profile"
        title={farmer.name}
        description="Review public farmer information, active crop listings, and verification status before engaging."
        actions={(
          <Button type="button" onClick={handleChat} disabled={startConversation.isPending}>
            <MessageCircle className="h-4 w-4" /> Start chat
          </Button>
        )}
      />

      <Card className="rounded-[18px] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <FarmerMiniCard farmer={farmer} />
          <div className="min-w-[220px] rounded-[14px] border border-ink-200 bg-ink-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">Verification</p>
            <div className="mt-2">
              <VerificationBadge status={farmer.verificationStatus} />
            </div>
            {farmer.verificationStatus !== "verified" ? (
              <p className="mt-3 flex gap-2 text-[12.5px] leading-5 text-gold-900">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                {UNVERIFIED_WARNING}
              </p>
            ) : (
              <p className="mt-3 text-[12.5px] leading-5 text-green-900">
                This supplier has completed AgriculNet identity review.
              </p>
            )}
          </div>
        </div>
      </Card>

      <Card className="rounded-[18px] p-6">
        <h2 className="font-display text-[20px] text-[#111827]">Active listings</h2>
        {relatedListings.length ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {relatedListings.map((listing) => (
              <CropCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-[14px] text-ink-500">This farmer has no active public listings yet.</p>
        )}
      </Card>
    </section>
  );
}
