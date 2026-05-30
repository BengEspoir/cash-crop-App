"use client";

import { useMemo, useState } from "react";
import { BookOpen, Clock3, Globe, LifeBuoy, MessageCircleMore, Search, ShieldCheck, WalletCards } from "lucide-react";
import {
  BuyerButton,
  BuyerEmptyState,
  BuyerPage,
  BuyerPanel,
  BuyerStatusBadge,
  formatBuyerDate,
} from "@/components/buyer/BuyerDesignSystem";
import { MediaAvatar } from "@/components/media/Avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateSupportTicket, useSupportTickets } from "@/hooks/useSupportTickets";
import { useDashboardData } from "@/hooks/useDashboardData";
import useAuth from "@/hooks/useAuth";

const HELP_CARDS = [
  {
    title: "Buyer Protection",
    description: "Learn how escrow, delivery confirmation, and disputes protect every buyer transaction.",
    icon: ShieldCheck,
    accent: "green",
  },
  {
    title: "Payments & Refunds",
    description: "Fapshi hosted checkout, MTN MoMo, Orange Money, and payment follow-up support.",
    icon: WalletCards,
    accent: "gold",
  },
  {
    title: "Order Tracking",
    description: "Track active orders, inspection status, shipping updates, and delivery milestones.",
    icon: Clock3,
    accent: "blue",
  },
  {
    title: "International Export",
    description: "Documentation, customs coordination, and Douala Port workflow support for export buyers.",
    icon: Globe,
    accent: "neutral",
  },
];

const FAQS = [
  {
    category: "Payments",
    question: "How does AgriculNet buyer protection work?",
    answer: "AgriculNet records the buyer payment in escrow and only releases it to the seller after order completion and buyer confirmation. Disputes can pause release while the support team reviews the order history.",
  },
  {
    category: "Orders",
    question: "Can I source crops directly from a specific farmer?",
    answer: "Yes. Buyers can open a listing, chat with the farmer or reseller, request a quote, or move directly into a protected order if the seller is eligible to receive commerce.",
  },
  {
    category: "Payments",
    question: "What payment methods are accepted on AgriculNet?",
    answer: "The current hosted checkout path supports MTN MoMo and Orange Money through Fapshi. Additional display-only methods may appear in settings, but only live channels are available in checkout.",
  },
  {
    category: "Export",
    question: "How do I request an export shipment via Douala Port?",
    answer: "Use the export-ready listings or submit a quote, then the support and trade coordination flow will manage inspection, documentation, and Douala Port preparation before dispatch.",
  },
  {
    category: "Farmers",
    question: "What if the farmer profile is not verified?",
    answer: "You can still browse, chat, and request a quote, but the platform warns the buyer. Only verified sellers can receive paid orders and platform-managed payments.",
  },
];

const GUIDES = [
  { title: "Getting Started: Your First Order on AgriculNet", meta: "5 min read · Buyers" },
  { title: "How to Pay Safely Using MTN MoMo or Orange Money", meta: "3 min read · Payments" },
  { title: "International Export: Documents and Douala Port Process", meta: "8 min read · Export" },
  { title: "How to Find and Verify Certified Farmers", meta: "4 min read · Farmers" },
  { title: "Opening a Dispute: Step-by-Step Guide", meta: "6 min read · Disputes" },
];

export default function BuyerHelpSupportPage() {
  const { user } = useAuth();
  const { data } = useDashboardData("buyer");
  const { data: ticketData, isLoading } = useSupportTickets();
  const createTicket = useCreateSupportTicket();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [form, setForm] = useState({ subject: "", category: "buyer_support", description: "", relatedEntityId: "" });
  const tickets = ticketData?.items || [];
  const orders = data?.orders || [];
  const payments = data?.payments || [];

  const filteredFaqs = useMemo(() => {
    return FAQS.filter((item) => {
      const matchesCategory = category === "All" || item.category === category;
      const needle = search.trim().toLowerCase();
      const matchesSearch = !needle || `${item.question} ${item.answer}`.toLowerCase().includes(needle);
      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  const submitTicket = async (event) => {
    event.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      return;
    }

    try {
      await createTicket.mutateAsync({
        subject: form.subject.trim(),
        description: form.description.trim(),
        category: form.category,
        priority: form.category === "payments" ? "high" : "normal",
        relatedEntityType: form.relatedEntityId ? "order" : null,
        relatedEntityId: form.relatedEntityId || null,
        metadata: {
          dashboardOrderCount: orders.length,
          dashboardPaymentCount: payments.length,
        },
      });
      setForm({ subject: "", category: "buyer_support", description: "", relatedEntityId: "" });
    } catch {
      // toast handled in hook consumer flow elsewhere if backend responds with error
    }
  };

  return (
    <BuyerPage className="space-y-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="section-eyebrow">Buyer help center</p>
          <h1 className="font-display text-[30px] text-ink-950 sm:text-[36px]">Help & Support</h1>
          <p className="mt-2 text-[16px] text-ink-500">Find answers, guides, and live ticket support without leaving your buyer dashboard.</p>
        </div>
        <BuyerButton variant="gold" icon={LifeBuoy} onClick={() => document.getElementById("support-ticket-form")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
          New Support Ticket
        </BuyerButton>
      </div>

      <section className="overflow-hidden rounded-[26px] bg-green-900 text-white shadow-lift">
        <div className="grid gap-6 px-6 py-8 lg:grid-cols-[1.5fr_0.7fr] lg:px-8">
          <div className="space-y-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-200">AgriculNet help center</p>
            <div>
              <h2 className="font-display text-[32px] leading-tight text-white">How can we help you today?</h2>
              <p className="mt-2 max-w-2xl text-[15px] leading-7 text-white/80">
                Search buyer support topics, review export guidance, or open a live support ticket for a payment, order, or farmer issue.
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-soft sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search help articles, guides, and payment questions..."
                  className="h-12 w-full rounded-xl border-0 bg-transparent pl-11 pr-3 text-[15px] text-ink-900 outline-none"
                />
              </div>
              <BuyerButton variant="primary" className="h-12 px-6" onClick={() => null}>
                Search
              </BuyerButton>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-2xl bg-white/8 p-4 backdrop-blur-sm">
              <p className="text-[24px] font-display text-white">124 Articles</p>
              <p className="mt-1 text-[13px] text-white/75">Knowledge base coverage for payments, sourcing, and export operations.</p>
            </div>
            <div className="rounded-2xl bg-white/8 p-4 backdrop-blur-sm">
              <p className="text-[24px] font-display text-white">&lt; 2 hrs</p>
              <p className="mt-1 text-[13px] text-white/75">Average support response time on buyer payment and order issues.</p>
            </div>
            <div className="rounded-2xl bg-white/8 p-4 backdrop-blur-sm">
              <p className="text-[24px] font-display text-white">Live chat</p>
              <p className="mt-1 text-[13px] text-white/75">Available Mon-Sat for order, delivery, and payment escalation.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-4">
        {HELP_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <BuyerPanel key={card.title} bodyClassName="p-5">
              <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${card.accent === "green" ? "bg-green-50 text-green-800" : card.accent === "gold" ? "bg-amber-50 text-amber-800" : card.accent === "blue" ? "bg-cyan-50 text-cyan-800" : "bg-ink-50 text-ink-700"}`}>
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-[24px] text-ink-950">{card.title}</h3>
              <p className="mt-2 text-[15px] leading-7 text-ink-500">{card.description}</p>
              <button type="button" className="mt-4 text-[14px] font-bold text-green-800">Learn more</button>
            </BuyerPanel>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
        <div className="space-y-6">
          <BuyerPanel
            title="Frequently Asked Questions"
            action={<BuyerButton variant="outline" className="h-11 px-5">View all articles</BuyerButton>}
          >
            <div className="mb-5 flex flex-wrap gap-2">
              {["All", "Orders", "Payments", "Export", "Account", "Farmers"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`rounded-full px-4 py-2 text-[13px] font-semibold ${category === item ? "bg-green-800 text-white" : "bg-ink-50 text-ink-500"}`}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {filteredFaqs.map((faq) => (
                <div key={faq.question} className="rounded-2xl border border-ink-100 px-5 py-4">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-400">{faq.category}</p>
                  <h3 className="mt-2 text-[18px] font-semibold text-ink-950">{faq.question}</h3>
                  <p className="mt-3 text-[15px] leading-7 text-ink-500">{faq.answer}</p>
                </div>
              ))}
              {!filteredFaqs.length ? (
                <BuyerEmptyState title="No FAQ matches that search" description="Try a different keyword or category." />
              ) : null}
            </div>
          </BuyerPanel>

          <BuyerPanel title="Buyer Guides & Tutorials">
            <div className="space-y-3">
              {GUIDES.map((guide) => (
                <div key={guide.title} className="flex items-center justify-between gap-4 rounded-2xl border border-ink-100 px-5 py-4 transition hover:border-green-200 hover:bg-green-50/40">
                  <div>
                    <h3 className="text-[16px] font-semibold text-ink-950">{guide.title}</h3>
                    <p className="mt-1 text-[13px] text-ink-500">{guide.meta}</p>
                  </div>
                  <BookOpen className="h-5 w-5 text-green-800" />
                </div>
              ))}
            </div>
          </BuyerPanel>

          <BuyerPanel title="Submit a support ticket" className="scroll-mt-28" bodyClassName="p-6" >
            <form id="support-ticket-form" onSubmit={submitTicket} className="grid gap-4">
              <label className="space-y-2">
                <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-400">Subject</span>
                <Input value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} placeholder="Payment not received, order issue..." className="h-12" />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-400">Category</span>
                  <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className="h-12 rounded-xl border border-ink-200 px-3 text-[15px]">
                    <option value="buyer_support">Buyer support</option>
                    <option value="payments">Payments</option>
                    <option value="orders">Orders</option>
                    <option value="export">Export</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-400">Related order (optional)</span>
                  <select value={form.relatedEntityId} onChange={(event) => setForm((current) => ({ ...current, relatedEntityId: event.target.value }))} className="h-12 rounded-xl border border-ink-200 px-3 text-[15px]">
                    <option value="">Select order</option>
                    {orders.map((order) => (
                      <option key={order.rawId || order.id} value={order.rawId || order.id}>
                        {order.id} · {order.crop}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="space-y-2">
                <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-400">Describe the issue</span>
                <Textarea
                  rows={5}
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Describe the payment, order, shipping, or seller issue in detail."
                />
              </label>
              <div className="flex justify-end">
                <BuyerButton type="submit" variant="primary" disabled={createTicket.isPending}>
                  {createTicket.isPending ? "Submitting..." : "Submit Ticket"}
                </BuyerButton>
              </div>
            </form>
          </BuyerPanel>
        </div>

        <div className="space-y-6">
          <BuyerPanel title="Platform status">
            <div className="space-y-3">
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
                <p className="text-[16px] font-semibold text-green-900">All systems operational</p>
                <p className="mt-1 text-[13px] text-green-800/80">Last checked just now</p>
              </div>
              {[
                ["Marketplace", "Operational"],
                ["MTN MoMo", "Operational"],
                ["Orange Money", "Operational"],
                ["SMS notifications", "Slight delay"],
                ["Logistics tracking", "Operational"],
              ].map(([label, status]) => (
                <div key={label} className="flex items-center justify-between gap-3 rounded-xl border border-ink-100 px-4 py-3">
                  <span className="text-[14px] text-ink-600">{label}</span>
                  <BuyerStatusBadge status={status === "Operational" ? "verified" : "pending"}>{status}</BuyerStatusBadge>
                </div>
              ))}
            </div>
          </BuyerPanel>

          <BuyerPanel title="Contact support">
            <div className="space-y-3">
              {[
                ["Live Chat", "Chat with an agent now", "Online"],
                ["WhatsApp", "+237 222 000 100", "Fast reply"],
                ["Email Support", "support@agriculnet.cm", "< 2 hrs"],
                ["Phone Support", "+237 222 000 100", "Weekdays"],
              ].map(([title, detail, badge]) => (
                <div key={title} className="flex items-center justify-between gap-3 rounded-2xl border border-ink-100 px-4 py-4">
                  <div>
                    <p className="text-[15px] font-semibold text-ink-950">{title}</p>
                    <p className="mt-1 text-[13px] text-ink-500">{detail}</p>
                  </div>
                  <BuyerStatusBadge status={badge === "Online" ? "verified" : "pending"}>{badge}</BuyerStatusBadge>
                </div>
              ))}
            </div>
          </BuyerPanel>

          <BuyerPanel title="My tickets" action={<button type="button" className="text-[14px] font-semibold text-green-800">View all</button>}>
            <div className="space-y-3">
              {tickets.length ? tickets.slice(0, 4).map((ticket) => (
                <div key={ticket.id} className="rounded-2xl border border-ink-100 px-4 py-4">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-400">{ticket.ticketNumber}</p>
                  <p className="mt-2 text-[15px] font-semibold text-ink-950">{ticket.subject}</p>
                  <p className="mt-1 text-[13px] text-ink-500">Opened {formatBuyerDate(ticket.createdAt)}</p>
                  <div className="mt-3">
                    <BuyerStatusBadge status={ticket.status}>{ticket.status}</BuyerStatusBadge>
                  </div>
                </div>
              )) : (
                <BuyerEmptyState title={isLoading ? "Loading tickets..." : "No support tickets yet"} description="Open a ticket when you need buyer support for orders, payments, or export coordination." />
              )}
            </div>
          </BuyerPanel>

          <BuyerPanel title="Helpful resources">
            <div className="space-y-3 text-[14px]">
              {[
                "AgriculNet Buyer Guide PDF",
                "ONCC export requirements",
                "MINADER trade portal",
                "Video tutorial: placing your first order",
              ].map((item) => (
                <button key={item} type="button" className="flex w-full items-center justify-between rounded-xl border border-ink-100 px-4 py-3 text-left text-green-800 transition hover:border-green-200 hover:bg-green-50/40">
                  <span>{item}</span>
                  <MessageCircleMore className="h-4 w-4" />
                </button>
              ))}
            </div>
          </BuyerPanel>

          <BuyerPanel title="Buyer account">
            <div className="flex items-center gap-4">
              <MediaAvatar
                src={user?.profile_image_url}
                alt={user?.first_name || "Buyer"}
                initials={`${user?.first_name?.[0] || "B"}${user?.last_name?.[0] || "Y"}`}
                size="lg"
                className="h-16 w-16 text-[20px]"
              />
              <div>
                <p className="font-display text-[24px] text-ink-950">{[user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.email}</p>
                <p className="text-[14px] text-ink-500">{[user?.city, user?.region].filter(Boolean).join(", ") || "Cameroon"}</p>
              </div>
            </div>
          </BuyerPanel>
        </div>
      </div>
    </BuyerPage>
  );
}
