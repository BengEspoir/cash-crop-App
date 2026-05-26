"use client";

import { useState } from "react";
import { BookOpen, HeartPulse, LifeBuoy, Scale, Search, ShieldCheck } from "lucide-react";
import {
  AdminCard,
  AdminDataTable,
  AdminEmptyPanel,
  AdminIconTile,
  AdminPageHeader,
  AdminStatusPill,
  formatAdminDate,
} from "@/components/admin/AdminDesignSystem";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateSupportTicket, useSupportTickets } from "@/hooks/useSupportTickets";

const faqs = [
  {
    title: "How to approve export-ready documents?",
    description: "Validate certificate ownership, expiry date, crop match, and port coordination details before marking a seller ready.",
  },
  {
    title: "How should payment reversals be handled?",
    description: "Keep the order protected, document the exception, and coordinate resolution before any payout action.",
  },
  {
    title: "When should a farmer profile be rejected?",
    description: "Reject only when required identity, location, or document evidence cannot be verified after review.",
  },
];

export default function AdminHelpSupportPage() {
  const { data, isLoading } = useSupportTickets();
  const createTicket = useCreateSupportTicket();
  const tickets = data?.items || [];
  const [form, setForm] = useState({ subject: "", description: "" });

  const submitTicket = (event) => {
    event.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) return;
    createTicket.mutate(
      {
        subject: form.subject.trim(),
        description: form.description.trim(),
        category: "admin_support",
        priority: "normal",
      },
      {
        onSuccess: () => setForm({ subject: "", description: "" }),
      },
    );
  };

  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="How can we help you, Admin?"
        eyebrow="Admin > Help & Support"
        description="Search for internal documentation, operational procedures, or system guidelines."
        actionLabel={null}
      />

      <AdminCard className="p-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-6 top-1/2 h-6 w-6 -translate-y-1/2 text-ink-400" />
            <input
              type="search"
              placeholder="e.g. How to handle MoMo payment reversals"
              className="h-16 w-full rounded-full border border-ink-200 bg-ink-50 pl-16 pr-6 text-[18px] outline-none transition focus:border-green-700 focus:bg-white focus:ring-4 focus:ring-green-800/10"
            />
          </div>
        </div>
      </AdminCard>

      <div className="grid gap-6 xl:grid-cols-3">
        <AdminIconTile
          icon={BookOpen}
          tone="blue"
          title="Admin Manuals"
          description="Read detailed guidelines on verifying farmers and moderating crop listings."
        />
        <AdminIconTile
          icon={Scale}
          tone="gold"
          title="Dispute Resolutions SOP"
          description="Standard operating procedures for managing buyer and farmer conflicts."
        />
        <AdminIconTile
          icon={HeartPulse}
          tone="green"
          title="System Status"
          description="Check the operational status of AgriculNet and payment gateways."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <AdminCard title="Frequently Asked Questions">
          <div className="divide-y divide-ink-100">
            {faqs.map((item) => (
              <div key={item.title} className="flex gap-4 px-6 py-5">
                <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-ink-400" />
                <div>
                  <h2 className="text-[18px] font-bold text-ink-900">{item.title}</h2>
                  <p className="mt-2 text-[15px] leading-7 text-ink-500">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard title="Contact IT Support">
          <form onSubmit={submitTicket} className="grid gap-4 p-6">
            <label className="space-y-2">
              <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink-400">Subject</span>
              <Input
                placeholder="Briefly describe the issue"
                value={form.subject}
                onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
              />
            </label>
            <label className="space-y-2">
              <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink-400">Details</span>
              <Textarea
                placeholder="Describe what needs operational support"
                rows={5}
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              />
            </label>
            <Button type="submit" variant="secondary" icon={LifeBuoy} isLoading={createTicket.isPending}>Create ticket</Button>
          </form>
        </AdminCard>
      </div>

      <AdminCard title="Support Tickets">
        {tickets.length ? (
          <AdminDataTable
            columns={[
              { key: "ticketNumber", label: "Ticket", render: (item) => <span className="font-bold text-ink-900">{item.ticketNumber}</span> },
              { key: "subject", label: "Subject", render: (item) => item.subject },
              { key: "creator", label: "Creator", render: (item) => item.creator?.name || "Unknown user" },
              { key: "priority", label: "Priority", render: (item) => <AdminStatusPill status={item.priority} /> },
              { key: "status", label: "Status", render: (item) => <AdminStatusPill status={item.status} /> },
              { key: "createdAt", label: "Created", render: (item) => formatAdminDate(item.createdAt) },
            ]}
            rows={tickets}
            emptyTitle="No live support tickets"
          />
        ) : (
          <div className="p-6">
            <AdminEmptyPanel
              title={isLoading ? "Loading support tickets..." : "No live support tickets"}
              description="Support requests created by dashboard users will appear here."
            />
          </div>
        )}
      </AdminCard>
    </section>
  );
}
