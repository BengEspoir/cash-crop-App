"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock3, DollarSign, Leaf, MessageSquare, Package, Plus } from "lucide-react";
import { VerificationBanner } from "@/components/common/VerificationBanner";
import {
  FarmerButton,
  FarmerEmptyState,
  FarmerHeader,
  FarmerMetricCard,
  FarmerPage,
  FarmerPanel,
  FarmerStatusBadge,
  compactCurrency,
  farmerDisplayName,
  farmerMetricIcons,
  formatShortDate,
} from "@/components/farmer/FarmerDesignSystem";
import useAuth from "@/hooks/useAuth";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function FarmerDashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useDashboardData("farmer");
  const listings = data?.listings || [];
  const orders = data?.orders || [];
  const conversations = data?.conversations || [];
  const metrics = data?.metrics || {};
  const activeListings = metrics.activeListings ?? listings.length;
  const openOrders = metrics.openOrders ?? orders.length;
  const openQuotes = metrics.openQuotes ?? (data?.quotes || []).filter((quote) => quote.status === "pending").length;
  const revenue = metrics.protectedRevenue || compactCurrency(orders.reduce((sum, order) => sum + Number(order.amount || 0), 0));

  return (
    <FarmerPage>
      <FarmerHeader
        title={`Good morning, ${user?.first_name || farmerDisplayName(user)}`}
        description={`${new Date().toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })} - Here is your farm market overview for today.`}
        action={<FarmerButton href="/find-farmers" variant="outline" icon={ArrowRight}>View Public Profile</FarmerButton>}
      />

      <VerificationBanner />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <FarmerMetricCard icon={Leaf} value={String(activeListings)} label="Active Listings" detail={`${listings.length} total crop records`} tag="Live" tone="green" />
        <FarmerMetricCard icon={Package} value={String(openOrders)} label="Open Orders" detail="Buyer demand requiring attention" tag={`${openQuotes} inquiries`} tone="blue" />
        <FarmerMetricCard icon={MessageSquare} value={String(metrics.unreadMessages ?? 0)} label="Unread Messages" detail="From buyer conversations" tag="Live inbox" tone="gold" />
        <FarmerMetricCard icon={DollarSign} value={revenue} label="Protected Revenue" detail="Across current orders" tag="Escrow safe" tone="cyan" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.7fr)]">
        <FarmerPanel
          title="Active Orders"
          action={<Link href="/farmer/orders" className="inline-flex items-center gap-2 text-[16px] font-bold text-green-800">View all <ArrowRight className="h-4 w-4" /></Link>}
          bodyClassName="p-0"
        >
          {isLoading ? (
            <div className="p-6 text-[15px] text-ink-500">Loading live orders...</div>
          ) : orders.length ? (
            <div className="divide-y divide-ink-100">
              {orders.slice(0, 3).map((order) => (
                <Link key={order.rawId || order.id} href={`/farmer/orders/${order.rawId || order.id}`} className="grid gap-4 px-6 py-5 transition hover:bg-ink-50 lg:grid-cols-[1fr_1fr_auto] lg:items-center">
                  <div>
                    <p className="text-[15px] text-ink-400">Order #{order.id}</p>
                    <p className="mt-1 text-[17px] font-bold text-ink-950">Buyer: {order.buyerName || "Buyer"}</p>
                  </div>
                  <div>
                    <p className="text-[18px] font-bold text-ink-950">{order.crop} - {order.quantity}</p>
                    <p className="mt-1 text-[17px] text-ink-600">{order.amountLabel}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <FarmerStatusBadge status={order.status} />
                    <span className="inline-flex items-center gap-2 text-[16px] font-bold text-green-800">Track <ArrowRight className="h-4 w-4" /></span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-6">
              <FarmerEmptyState title="No active orders yet" description="Orders will appear here once buyers place real requests for your listings." />
            </div>
          )}
        </FarmerPanel>

        <FarmerPanel
          title="Active Conversations"
          action={<FarmerStatusBadge status="pending">{metrics.unreadMessages ?? 0} unread</FarmerStatusBadge>}
          bodyClassName="p-0"
        >
          {conversations.length ? (
            <div className="divide-y divide-ink-100">
              {conversations.slice(0, 4).map((conversation) => (
                <Link key={conversation.id} href={`/farmer/messages/${conversation.id}`} className="flex gap-4 px-6 py-5 transition hover:bg-ink-50">
                  <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-800 text-[17px] font-bold text-white">
                    {(conversation.participant || "Buyer").slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-3">
                      <p className="truncate text-[18px] font-bold text-ink-950">{conversation.participant}</p>
                      <p className="text-[13px] text-ink-400">{formatShortDate(conversation.createdAt)}</p>
                    </div>
                    <p className="mt-1 truncate text-[16px] text-ink-500">{conversation.preview}</p>
                    {conversation.listingId ? <span className="mt-2 inline-flex rounded-full bg-green-50 px-3 py-1 text-[13px] font-bold text-green-800">Listing linked</span> : null}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-6">
              <FarmerEmptyState title="No conversations yet" description="Buyer messages will appear here when shoppers contact you." />
            </div>
          )}
        </FarmerPanel>
      </div>

      <FarmerPanel
        title="Recent Listings"
        action={<Link href="/farmer/listings" className="inline-flex items-center gap-2 text-[16px] font-bold text-green-800">Manage listings <ArrowRight className="h-4 w-4" /></Link>}
      >
        {listings.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {listings.slice(0, 3).map((listing) => {
              const Icon = farmerMetricIcons.listings;
              return (
                <Link key={listing.id} href={`/farmer/listings/${listing.id}`} className="rounded-xl border border-ink-100 p-5 transition hover:border-green-800 hover:bg-green-50/40">
                  <Icon className="h-7 w-7 text-green-800" />
                  <h3 className="mt-4 text-[18px] font-bold text-ink-950">{listing.crop}</h3>
                  <p className="mt-1 text-[15px] text-ink-500">{listing.quantity} - {listing.location}</p>
                  <p className="mt-3 text-[17px] font-bold text-amber-700">{listing.price}</p>
                </Link>
              );
            })}
          </div>
        ) : (
          <FarmerEmptyState
            title="No listings yet"
            description="Create your first crop listing to make inventory visible to buyers."
            action={<FarmerButton href="/farmer/listings/new" icon={Plus}>Add New Listing</FarmerButton>}
          />
        )}
      </FarmerPanel>

      <FarmerPanel>
        <div className="flex flex-col gap-4 rounded-xl bg-green-50 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <p className="inline-flex items-center gap-3 text-[15px] font-semibold text-green-900">
            <BadgeCheck className="h-5 w-5" />
            Keep dispatch notes and payout details current so protected orders can move faster.
          </p>
          <span className="inline-flex items-center gap-2 text-[14px] font-bold text-green-800">
            <Clock3 className="h-4 w-4" />
            Live dashboard sync
          </span>
        </div>
      </FarmerPanel>
    </FarmerPage>
  );
}
