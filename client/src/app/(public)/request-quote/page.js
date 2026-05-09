"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { AlertTriangle } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { PageHeader } from "../../../components/common/PageHeader";
import { VerificationBadge } from "../../../components/farmers/VerificationBadge";
import { useListings } from "../../../hooks/useListings";
import { useCreateQuote } from "../../../hooks/useQuotes";
import useAuth from "../../../hooks/useAuth";

const UNVERIFIED_WARNING = "This seller account is not yet verified. Please proceed carefully because this profile has not completed National ID verification.";

export default function RequestQuotePage() {
  const searchParams = useSearchParams();
  const selectedListingId = searchParams.get("listingId") || "";
  const { user, isBuyer } = useAuth();
  const { listings, isLoading } = useListings();
  const createQuote = useCreateQuote();
  const [listingId, setListingId] = useState(selectedListingId);
  const [form, setForm] = useState({
    quantity: "",
    requestedPrice: "",
    message: "",
  });
  const [submittedQuote, setSubmittedQuote] = useState(null);

  useEffect(() => {
    if (selectedListingId) setListingId(selectedListingId);
  }, [selectedListingId]);

  const listing = useMemo(
    () => listings.find((item) => item.id === listingId),
    [listings, listingId],
  );

  const update = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      toast.error("Please sign in as a buyer to submit a quote request.");
      return;
    }
    if (!isBuyer) {
      toast.error("Only buyer accounts can request quotes.");
      return;
    }
    if (!listingId) {
      toast.error("Choose a crop listing first.");
      return;
    }
    if (listing?.farmerVerificationStatus !== "verified") {
      toast(UNVERIFIED_WARNING);
    }

    try {
      const result = await createQuote.mutateAsync({
        listingId,
        quantity: form.quantity ? Number(form.quantity) : null,
        requestedPrice: form.requestedPrice ? Number(form.requestedPrice) : null,
        currency: listing?.currency || "XAF",
        message: form.message,
      });
      setSubmittedQuote(result.quote);
      if (result.farmerWarning) toast(result.farmerWarning);
      toast.success("Quote request saved.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Quote request failed.");
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Request A Quote"
        title="Request real supply pricing"
        description="Quote requests are saved to your buyer account and delivered to the farmer dashboard."
      />

      <Card className="rounded-[18px] p-6">
        {!user ? (
          <div className="mb-5 rounded-[14px] border border-gold-200 bg-gold-50 px-4 py-3 text-[13px] text-gold-900">
            Sign in as a buyer before submitting. You can still review available listings below.
          </div>
        ) : null}
        {!isBuyer && user ? (
          <div className="mb-5 rounded-[14px] border border-gold-200 bg-gold-50 px-4 py-3 text-[13px] text-gold-900">
            Quote requests are available to buyer accounts.
          </div>
        ) : null}

        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="md:col-span-2">
            <Label>Crop listing</Label>
            <select
              value={listingId}
              onChange={(event) => setListingId(event.target.value)}
              required
              className="mt-2 h-11 w-full rounded-[10px] border border-ink-300 bg-white px-3 text-[14px] text-ink-800 outline-none transition-all duration-200 focus:border-green-800 focus:ring-4 focus:ring-green-800/10"
            >
              <option value="">{isLoading ? "Loading listings..." : "Choose a real crop listing"}</option>
              {listings.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.crop} - {item.quantityLabel} - {item.location}
                </option>
              ))}
            </select>
          </div>

          {listing ? (
            <div className="md:col-span-2 rounded-[14px] border border-ink-200 bg-ink-50 px-4 py-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-ink-900">{listing.crop}</p>
                  <p className="text-[12.5px] text-ink-600">{listing.price} from {listing.farmer?.name || "farmer"}</p>
                </div>
                <VerificationBadge status={listing.farmerVerificationStatus} />
              </div>
              {listing.farmerVerificationStatus !== "verified" ? (
                <p className="mt-3 flex gap-2 text-[12.5px] leading-5 text-gold-900">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  {UNVERIFIED_WARNING}
                </p>
              ) : null}
            </div>
          ) : null}

          <div>
            <Label>Target quantity</Label>
            <Input type="number" min="0" step="0.01" placeholder="e.g. 2000" required value={form.quantity} onChange={update("quantity")} />
          </div>
          <div>
            <Label>Requested price per unit</Label>
            <Input type="number" min="0" step="0.01" placeholder="Optional" value={form.requestedPrice} onChange={update("requestedPrice")} />
          </div>
          <div className="md:col-span-2">
            <Label>Trade notes</Label>
            <textarea
              className="mt-2 min-h-[120px] w-full rounded-[12px] border border-[#D1D5DB] px-3 py-3 text-[14px] outline-none focus:border-green-800 focus:ring-4 focus:ring-green-800/10"
              placeholder="Share quality, packaging, pickup, and delivery expectations."
              required
              value={form.message}
              onChange={update("message")}
            />
          </div>

          {submittedQuote ? (
            <p className="rounded-[12px] bg-[#D4EDDA] px-4 py-3 text-[12px] text-[#1A5C2E] md:col-span-2">
              Quote request saved with status {submittedQuote.status}. The farmer can now review it from their dashboard.
            </p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-3 md:col-span-2">
            {!user ? (
              <Button asChild variant="outline">
                <Link href="/sign-in">Sign in</Link>
              </Button>
            ) : null}
            <Button type="submit" disabled={createQuote.isPending || !user || !isBuyer}>
              Submit Quote Request
            </Button>
          </div>
        </form>
      </Card>
    </section>
  );
}
