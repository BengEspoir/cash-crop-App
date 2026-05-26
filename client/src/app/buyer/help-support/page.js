"use client";

import { useState } from "react";
import { LifeBuoy, Search, ShieldCheck, ShoppingBasket, WalletCards } from "lucide-react";
import {
  BuyerButton,
  BuyerEmptyState,
  BuyerHeader,
  BuyerPage,
  BuyerPanel,
  BuyerStatusBadge,
  formatBuyerDate,
} from "@/components/buyer/BuyerDesignSystem";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateSupportTicket, useSupportTickets } from "@/hooks/useSupportTickets";
import { useDashboardData } from "@/hooks/useDashboardData";

const categories = [
  { title: "Protected Orders", description: "Get help with sourcing orders, escrow state, and delivery milestones.", icon: ShieldCheck },
  { title: "Crop Sourcing", description: "Resolve questions about saved crops, farmers, quotes, and listing details.", icon: ShoppingBasket },
  { title: "Buyer Payments", description: "Review payment status, refund paths, and ledger questions.", icon: WalletCards },
];

export default function BuyerHelpSupportPage() {
  const { data } = useDashboardData("buyer");
  const { data: ticketData, isLoading } = useSupportTickets();
  const createTicket = useCreateSupportTicket();
  const tickets = ticketData?.items || [];
  const orders = data?.orders?.length || 0;
  const payments = data?.payments?.length || 0;
  const [form, setForm] = useState({ subject: "", description: "" });

  const submitTicket = (event) => {
    event.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) return;
    createTicket.mutate(
      {
        subject: form.subject.trim(),
        description: form.description.trim(),
        category: "buyer_support",
        priority: "normal",
        metadata: { orders, payments },
      },
      { onSuccess: () => setForm({ subject: "", description: "" }) },
    );
  };

  return (
    <BuyerPage className="mx-auto max-w-6xl">
      <BuyerHeader title="Help & Support" description="Get buyer support without leaving your dashboard workspace." />

      <div className="relative">
        <Search className="pointer-events-none absolute left-6 top-1/2 h-6 w-6 -translate-y-1/2 text-ink-400" />
        <input
          type="search"
          placeholder="Search buyer support topics..."
          className="h-16 w-full rounded-2xl border border-ink-200 bg-white pl-16 pr-6 text-[18px] text-ink-800 outline-none transition focus:border-green-700 focus:ring-4 focus:ring-green-800/10"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {categories.map((item) => {
          const Icon = item.icon;
          return (
            <BuyerPanel key={item.title} bodyClassName="p-7">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-green-50 text-green-800">
                <Icon className="h-7 w-7" />
              </span>
              <h2 className="mt-6 text-[20px] font-bold text-ink-950">{item.title}</h2>
              <p className="mt-3 text-[16px] leading-7 text-ink-500">{item.description}</p>
            </BuyerPanel>
          );
        })}
      </div>

      <BuyerPanel title="Support Tickets">
        <form onSubmit={submitTicket} className="mb-6 grid gap-4 rounded-xl border border-ink-100 bg-ink-50 p-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-[14px] font-semibold text-ink-700">Subject</span>
            <Input
              placeholder="What do you need help with?"
              value={form.subject}
              onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
            />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-[14px] font-semibold text-ink-700">Details</span>
            <Textarea
              rows={4}
              placeholder="Share order, payment, farmer, or crop details"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            />
          </label>
          <div className="md:col-span-2">
            <BuyerButton type="submit" variant="gold" icon={LifeBuoy} disabled={createTicket.isPending}>
              Create support ticket
            </BuyerButton>
          </div>
        </form>

        {tickets.length ? (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <article key={ticket.id} className="rounded-xl border border-ink-100 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-ink-400">{ticket.ticketNumber}</p>
                    <h2 className="mt-2 text-[19px] font-bold text-ink-950">{ticket.subject}</h2>
                    <p className="mt-2 text-[15px] leading-6 text-ink-500">{ticket.description}</p>
                  </div>
                  <BuyerStatusBadge status={ticket.status}>{ticket.status}</BuyerStatusBadge>
                </div>
                <p className="mt-4 text-[14px] text-ink-400">
                  {ticket.messageCount} messages - last updated {formatBuyerDate(ticket.lastMessageAt || ticket.createdAt)}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <BuyerEmptyState
            title={isLoading ? "Loading support tickets..." : "No live support tickets"}
            description={`Current buyer context: ${orders} orders and ${payments} payment records.`}
          />
        )}
      </BuyerPanel>
    </BuyerPage>
  );
}
