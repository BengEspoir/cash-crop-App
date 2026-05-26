"use client";

import Link from "next/link";
import { ArrowRight, CreditCard, Heart, MessageSquare, Package } from "lucide-react";
import {
  BuyerButton,
  BuyerConversationPreview,
  BuyerEmptyState,
  BuyerHeader,
  BuyerMetricCard,
  BuyerOrderSummary,
  BuyerPage,
  BuyerPanel,
  BuyerStatusBadge,
  compactBuyerCurrency,
  buyerDisplayName,
} from "@/components/buyer/BuyerDesignSystem";
import { VerificationBanner } from "@/components/common/VerificationBanner";
import useAuth from "@/hooks/useAuth";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function BuyerDashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useDashboardData("buyer");
  const orders = data?.orders || [];
  const listings = data?.listings || [];
  const conversations = data?.conversations || [];
  const metrics = data?.metrics || {};
  const activeOrders = metrics.activeOrders ?? orders.length;
  const savedListings = metrics.savedListings ?? data?.savedListings?.length ?? 0;
  const unreadMessages = metrics.unreadMessages ?? conversations.reduce((sum, item) => sum + (item.unread || 0), 0);
  const sourcedTotal = orders.reduce((sum, order) => sum + Number(order.amount || 0), 0);

  return (
    <BuyerPage>
      <BuyerHeader
        title={`Good morning, ${user?.first_name || buyerDisplayName(user)}`}
        description={`${new Date().toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })} - Here is your sourcing overview for today.`}
        action={<BuyerButton href="/buyer/profile" variant="outline" icon={ArrowRight}>View Public Profile</BuyerButton>}
      />

      <VerificationBanner />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <BuyerMetricCard icon={Package} value={String(activeOrders)} label="Active Orders" detail={`From ${orders.length} order records`} tag="In transit" tone="blue" />
        <BuyerMetricCard icon={Heart} value={String(savedListings)} label="Saved Crops" detail="Monitoring live prices" tag="+3 this week" tone="green" />
        <BuyerMetricCard icon={MessageSquare} value={String(unreadMessages)} label="Unread Messages" detail="Direct chats with farmers" tag="Requires reply" tone="gold" />
        <BuyerMetricCard icon={CreditCard} value={compactBuyerCurrency(sourcedTotal)} label="Total Sourced" detail="Completed trade volume" tag="Escrow Protected" tone="gold" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
        <BuyerPanel
          title="Active Orders & Shipments"
          action={<Link href="/buyer/orders" className="inline-flex items-center gap-2 text-[16px] font-bold text-green-800">View all ({orders.length}) <ArrowRight className="h-4 w-4" /></Link>}
          bodyClassName="p-0"
        >
          {isLoading ? (
            <div className="p-6 text-[15px] text-ink-500">Loading live orders...</div>
          ) : orders.length ? (
            orders.slice(0, 3).map((order) => <BuyerOrderSummary key={order.rawId || order.id} order={order} />)
          ) : (
            <div className="p-6">
              <BuyerEmptyState title="No active orders yet" description="Orders will appear here after you place real crop orders." action={<BuyerButton href="/browse">Browse Crops</BuyerButton>} />
            </div>
          )}
        </BuyerPanel>

        <BuyerPanel
          title="Recent Inquiries"
          action={<Link href="/buyer/messages" className="inline-flex items-center gap-2 text-[16px] font-bold text-green-800">Go to Messages <ArrowRight className="h-4 w-4" /></Link>}
          bodyClassName="p-0"
        >
          {conversations.length ? (
            conversations.slice(0, 4).map((conversation) => (
              <BuyerConversationPreview key={conversation.id} conversation={conversation} />
            ))
          ) : (
            <div className="p-6">
              <BuyerEmptyState title="No inquiries yet" description="Start a chat from a crop listing or farmer profile." action={<BuyerButton href="/browse" variant="outline">Browse Market</BuyerButton>} />
            </div>
          )}
        </BuyerPanel>
      </div>

      <BuyerPanel
        title="Recommended Crop Listings"
        action={<Link href="/browse" className="inline-flex items-center gap-2 text-[16px] font-bold text-green-800">Browse Market <ArrowRight className="h-4 w-4" /></Link>}
      >
        {listings.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {listings.slice(0, 4).map((listing) => (
              <Link key={listing.id} href={`/crops/${listing.id}`} className="rounded-xl border border-ink-100 p-5 transition-all duration-200 hover:border-green-800 hover:bg-green-50/40 motion-safe:hover:-translate-y-0.5">
                <h3 className="text-[18px] font-bold text-ink-950">{listing.crop}</h3>
                <p className="mt-2 text-[15px] text-ink-500">{listing.quantity} - {listing.location}</p>
                <p className="mt-4 text-[20px] font-bold text-green-800">{listing.price}</p>
                <BuyerStatusBadge status={listing.farmerVerificationStatus || "pending"} className="mt-4">{listing.farmerVerificationStatus === "verified" ? "Verified" : "Review status"}</BuyerStatusBadge>
              </Link>
            ))}
          </div>
        ) : (
          <BuyerEmptyState title="No suggestions available" description="Marketplace listings will appear here when active crop records are available." action={<BuyerButton href="/browse">Open Browse Crops</BuyerButton>} />
        )}
      </BuyerPanel>
    </BuyerPage>
  );
}
