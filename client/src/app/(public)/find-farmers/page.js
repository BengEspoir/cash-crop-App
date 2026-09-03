"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Search, SlidersHorizontal } from "lucide-react";
import { EmptyState } from "../../../components/common/EmptyState";
import { FarmerMiniCard } from "../../../components/farmers/FarmerMiniCard";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { useFarmers } from "../../../hooks/useFarmers";
import { useStartConversation } from "../../../hooks/useMessages";
import useAuth from "../../../hooks/useAuth";
import { getLoginRoute } from "../../../lib/authRoutes";
import { MarketplaceSearchNav } from "../../../components/search/MarketplaceSearchNav";

const initialFilters = {
  query: "",
  crop: "",
  region: "",
  verificationStatus: "verified",
  sort: "rating",
  page: 1,
  limit: 8,
  sellerType: "",
};

export default function FindFarmersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isBuyer } = useAuth();
  const typeParam = searchParams.get("type");
  const initialSellerType = ["farmer", "reseller"].includes(typeParam) ? typeParam : "";
  const [draftFilters, setDraftFilters] = useState({ ...initialFilters, sellerType: initialSellerType });
  const [filters, setFilters] = useState({ ...initialFilters, sellerType: initialSellerType });

  useEffect(() => {
    const nextSellerType = ["farmer", "reseller"].includes(typeParam) ? typeParam : "";
    setDraftFilters((current) => ({ ...current, sellerType: nextSellerType, page: 1 }));
    setFilters((current) => ({ ...current, sellerType: nextSellerType, page: 1 }));
  }, [typeParam]);

  const { farmers, count, page, totalPages, isLoading, error } = useFarmers(filters);
  const startConversation = useStartConversation();

  const updateDraft = (key, value) => setDraftFilters((current) => ({ ...current, [key]: value, page: 1 }));
  const applyFilters = (event) => {
    event.preventDefault();
    setFilters({ ...draftFilters, page: 1 });
  };

  const handleChat = async (farmer) => {
    if (!user) {
      toast.error("Please sign in as a buyer to start a chat.");
      router.push(getLoginRoute(`/farmers/${farmer.id}`));
      return;
    }
    if (!isBuyer) {
      toast.error("Buyer accounts can start chats from public farmer profiles.");
      return;
    }
    try {
      const result = await startConversation.mutateAsync({ farmerId: farmer.id });
      if (result?.farmerWarning) toast(result.farmerWarning);
      router.push(`/buyer/messages/${result.conversation.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not start chat.");
    }
  };

  const pageTitle = filters.sellerType === "reseller"
    ? "Verified Resellers"
    : filters.sellerType === "farmer"
      ? "Verified Farmers"
      : "Verified Suppliers";

  const pageDescription = filters.sellerType === "reseller"
    ? "Find trusted agricultural resellers and aggregators across Cameroon, verified for marketplace trade."
    : filters.sellerType === "farmer"
      ? "Find trusted farmers by crop and region, then review their verified marketplace profiles before starting a conversation."
      : "Find trusted farmers and resellers by crop and region, then review their verified marketplace profiles before starting a conversation.";

  const activeNav = filters.sellerType === "reseller"
    ? "resellers"
    : filters.sellerType === "farmer"
      ? "farmers"
      : "";

  return (
    <section className="mx-auto max-w-[1240px] space-y-7 py-4 sm:py-8">
      <header className="mx-auto max-w-[760px] text-center">
        <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-[#1E5E27]">
          {filters.sellerType === "reseller" ? "Reseller directory" : "Farmer & supplier directory"}
        </p>
        <h1 className="mt-3 font-display text-[38px] leading-[1.1] text-[#172019] sm:text-[48px]">{pageTitle}</h1>
        <p className="mt-4 text-[15px] leading-7 text-[#68736B]">
          {pageDescription}
        </p>
      </header>
      <MarketplaceSearchNav active={activeNav} />

      <form onSubmit={applyFilters} className="rounded-[14px] border border-[#DEE4DF] bg-white p-4 shadow-[0_7px_24px_rgba(20,48,25,0.04)]">
        <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-[#29342C]">
          <SlidersHorizontal className="h-4 w-4 text-[#1E5E27]" />
          Search and filter profiles
        </div>
        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1.6fr)_1fr_1fr_auto]">
          <label className="relative">
            <span className="sr-only">Search farmers</span>
            <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[#7B867E]" />
            <input
              value={draftFilters.query}
              onChange={(event) => updateDraft("query", event.target.value)}
              placeholder="Search by name, crop, or location"
              className="h-11 w-full rounded-[9px] border border-[#DCE2DD] bg-[#FAFBFA] pl-10 pr-3 text-[13px] outline-none focus:border-[#1E5E27] focus:ring-4 focus:ring-[#1E5E27]/10"
            />
          </label>
          <select value={draftFilters.crop} onChange={(event) => updateDraft("crop", event.target.value)} className="h-11 rounded-[9px] border border-[#DCE2DD] bg-[#FAFBFA] px-3 text-[13px] outline-none focus:border-[#1E5E27]">
            <option value="">All crops</option>
            {["Coffee", "Cocoa", "Rubber", "Oil Palm", "Cotton", "Timber"].map((crop) => <option key={crop} value={crop}>{crop}</option>)}
          </select>
          <select value={draftFilters.region} onChange={(event) => updateDraft("region", event.target.value)} className="h-11 rounded-[9px] border border-[#DCE2DD] bg-[#FAFBFA] px-3 text-[13px] outline-none focus:border-[#1E5E27]">
            <option value="">All regions</option>
            {["Adamawa", "Centre", "East", "Far North", "Littoral", "North", "North West", "South", "South West", "West"].map((region) => <option key={region} value={region}>{region}</option>)}
          </select>
          <Button type="submit" className="h-11 bg-[#1E5E27] px-7 hover:bg-[#174B20]">
            <Search className="mr-2 h-4 w-4" /> Search
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <select value={draftFilters.sellerType} onChange={(event) => updateDraft("sellerType", event.target.value)} className="h-9 rounded-[8px] border border-[#DCE2DD] bg-white px-3 text-[12px]">
            <option value="">All suppliers</option>
            <option value="farmer">Farmers</option>
            <option value="reseller">Resellers</option>
          </select>
          <label className="flex items-center gap-2 text-[13px] text-[#536057]">
            <input
              type="checkbox"
              checked={draftFilters.verificationStatus === "verified"}
              onChange={(event) => updateDraft("verificationStatus", event.target.checked ? "verified" : "")}
              className="h-4 w-4 rounded border-[#BEC9C0] accent-[#1E5E27]"
            />
            Verified profiles only
          </label>
          <select value={draftFilters.sort} onChange={(event) => updateDraft("sort", event.target.value)} className="h-9 rounded-[8px] border border-[#DCE2DD] bg-white px-3 text-[12px]">
            <option value="rating">Highest rated</option>
            <option value="recent">Recently joined</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>
      </form>

      {isLoading ? (
        <Card className="rounded-[14px] p-10 text-center text-[#68736B]">
          Loading {filters.sellerType === "reseller" ? "reseller" : filters.sellerType === "farmer" ? "farmer" : "supplier"} profiles...
        </Card>
      ) : error ? (
        <Card className="rounded-[14px] p-10 text-center text-red-700">Profiles could not be loaded.</Card>
      ) : farmers.length ? (
        <>
          <div className="flex items-center justify-between gap-4">
            <p className="text-[13px] text-[#68736B]">
              {count} {filters.sellerType === "reseller" ? "reseller" : filters.sellerType === "farmer" ? "farmer" : "supplier"} profile{count === 1 ? "" : "s"} found
            </p>
            <span className="text-[12px] text-[#889189]">Page {page} of {totalPages}</span>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {farmers.map((farmer) => (
              <FarmerMiniCard
                key={farmer.id}
                farmer={farmer}
                onChat={handleChat}
                chatDisabled={startConversation.isPending}
              />
            ))}
          </div>
          {totalPages > 1 ? (
            <nav className="flex items-center justify-center gap-2 pt-3" aria-label="Farmer results pages">
              <button type="button" disabled={page <= 1} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))} className="h-9 rounded-[8px] border border-[#D6DED7] px-4 text-[12px] font-semibold text-[#38463C] hover:border-[#1E5E27] disabled:opacity-40">Previous</button>
              <span className="flex h-9 min-w-9 items-center justify-center rounded-[8px] bg-[#1E5E27] px-3 text-[12px] font-bold text-white">{page}</span>
              <button type="button" disabled={page >= totalPages} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))} className="h-9 rounded-[8px] border border-[#D6DED7] px-4 text-[12px] font-semibold text-[#38463C] hover:border-[#1E5E27] disabled:opacity-40">Next</button>
            </nav>
          ) : null}
        </>
      ) : (
        <EmptyState
          title={`No ${filters.sellerType === "reseller" ? "resellers" : filters.sellerType === "farmer" ? "farmers" : "suppliers"} found`}
          description="Try broadening the crop, region, or verification filters."
        />
      )}
    </section>
  );
}
