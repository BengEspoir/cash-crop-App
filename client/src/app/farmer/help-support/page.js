"use client";

import { useState } from "react";
import { LifeBuoy, Search } from "lucide-react";
import {
  FarmerButton,
  FarmerEmptyState,
  FarmerHeader,
  FarmerPage,
  FarmerPanel,
  FarmerStatusBadge,
  farmerHelpCategories,
  formatShortDate,
} from "@/components/farmer/FarmerDesignSystem";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateSupportTicket, useSupportTickets } from "@/hooks/useSupportTickets";

const faqs = [
  {
    q: "How do I publish a new crop listing?",
    a: "Use Add New Listing, complete the crop details, pricing, quantity, and photo sections, then submit it for marketplace review.",
  },
  {
    q: "Where do payout records appear?",
    a: "Payments and payout status appear on the Payments page after protected order payment activity is recorded.",
  },
  {
    q: "Why is support ticket history empty?",
    a: "Ticket history appears after you create support requests from this dashboard.",
  },
];

export default function FarmerHelpSupportPage() {
  const { data } = useDashboardData("farmer");
  const { data: ticketData, isLoading } = useSupportTickets();
  const createTicket = useCreateSupportTicket();
  const activeOrders = data?.orders?.length || 0;
  const activeListings = data?.listings?.length || 0;
  const tickets = ticketData?.items || [];
  const [form, setForm] = useState({ subject: "", description: "" });

  const submitTicket = (event) => {
    event.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) return;
    createTicket.mutate(
      {
        subject: form.subject.trim(),
        description: form.description.trim(),
        category: "farmer_support",
        priority: "normal",
        metadata: { activeListings, activeOrders },
      },
      {
        onSuccess: () => setForm({ subject: "", description: "" }),
      },
    );
  };

  return (
    <FarmerPage className="mx-auto max-w-6xl">
      <FarmerHeader title="Help & Support" description="Find answers to your questions or get in touch with the AgriculNet team." />

      <div className="relative">
        <Search className="pointer-events-none absolute left-7 top-1/2 h-7 w-7 -translate-y-1/2 text-ink-400" />
        <input
          type="search"
          placeholder="Search for articles, guides, or questions..."
          className="h-20 w-full rounded-2xl border border-ink-200 bg-white pl-20 pr-6 text-[20px] text-ink-800 outline-none transition focus:border-green-700 focus:ring-4 focus:ring-green-800/10"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {farmerHelpCategories.map((item) => {
          const Icon = item.icon;
          return (
            <FarmerPanel key={item.title} bodyClassName="p-9">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-green-50 text-green-800">
                <Icon className="h-8 w-8" />
              </span>
              <h2 className="mt-8 text-[22px] font-bold text-ink-950">{item.title}</h2>
              <p className="mt-3 text-[17px] leading-7 text-ink-500">{item.description}</p>
            </FarmerPanel>
          );
        })}
      </div>

      <FarmerPanel title="Frequently Asked Questions">
        <div className="divide-y divide-ink-100">
          {faqs.map((faq) => (
            <details key={faq.q} className="group py-5">
              <summary className="cursor-pointer list-none text-[18px] font-bold text-ink-950">{faq.q}</summary>
              <p className="mt-3 text-[16px] leading-7 text-ink-500">{faq.a}</p>
            </details>
          ))}
        </div>
      </FarmerPanel>

      <FarmerPanel title="Support Tickets">
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
              placeholder="Share crop, order, payout, or verification details"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            />
          </label>
          <div className="md:col-span-2">
            <FarmerButton type="submit" icon={LifeBuoy} disabled={createTicket.isPending}>
              Create support ticket
            </FarmerButton>
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
                  <FarmerStatusBadge status={ticket.status}>{ticket.status}</FarmerStatusBadge>
                </div>
                <p className="mt-4 text-[14px] text-ink-400">
                  {ticket.messageCount} messages - last updated {formatShortDate(ticket.lastMessageAt || ticket.createdAt)}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <FarmerEmptyState
            title={isLoading ? "Loading support tickets..." : "No live support tickets"}
            description={`Current platform context: ${activeListings} live listings and ${activeOrders} live orders.`}
          />
        )}
      </FarmerPanel>
    </FarmerPage>
  );
}
