"use client";

import { useState } from "react";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { HeroBanner } from "../../../components/common/HeroBanner";
import { ContentSection } from "../../../components/common/ContentSection";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card } from "../../../components/ui/card";
import { pageImagery } from "../../../lib/imagery";

const details = [
  { icon: Phone, label: "Phone", value: "+237 6 00 00 00 00", hint: "Weekdays 08:00–18:00 WAT" },
  { icon: Mail, label: "Email", value: "hello@agriculnet.example", hint: "Responses within 24 hours" },
  { icon: MapPin, label: "Office", value: "Douala, Cameroon", hint: "By appointment only" },
  { icon: Clock, label: "Support", value: "En/Fr support desk", hint: "WhatsApp available" },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-8">
      <HeroBanner
        eyebrow="Contact"
        title="Let's talk trade, verification, or platform onboarding."
        description="Whether you represent a cooperative, a wholesaler, or a single-farm operation, our team will route your request to the right desk."
        image={pageImagery.contact}
      />

      <ContentSection eyebrow="Reach us" title="How to get in touch">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {details.map(({ icon: Icon, label, value, hint }) => (
            <Card key={label} className="rounded-2xl p-5 shadow-soft">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-800">
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-[12px] uppercase tracking-[0.14em] text-ink-500">{label}</p>
              <p className="font-display text-[16px] text-ink-800">{value}</p>
              <p className="mt-1 text-[12px] text-ink-500">{hint}</p>
            </Card>
          ))}
        </div>
      </ContentSection>

      <ContentSection eyebrow="Write to us" title="Send the AgriculNet team a message">
        <Card className="rounded-2xl p-6 shadow-soft">
          {submitted ? (
            <div className="rounded-xl bg-green-50 p-6 text-center">
              <p className="font-display text-[18px] text-green-800">Thanks — we&rsquo;ve received your note.</p>
              <p className="mt-2 text-[13px] text-ink-700">
                A member of the team will respond within one business day.
              </p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-[12px] font-semibold text-ink-700">Full name</span>
                  <Input required placeholder="Jean Ngum" />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[12px] font-semibold text-ink-700">Work email</span>
                  <Input required type="email" placeholder="you@company.com" />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[12px] font-semibold text-ink-700">Role</span>
                  <select
                    required
                    className="h-11 w-full rounded-[10px] border border-ink-300 bg-white px-3 text-[13px] text-ink-800 focus:border-green-800 focus:outline-none focus:ring-4 focus:ring-green-800/10"
                    defaultValue=""
                  >
                    <option value="" disabled>Choose one</option>
                    <option>Farmer / producer</option>
                    <option>Cooperative lead</option>
                    <option>Buyer / wholesaler</option>
                    <option>Exporter</option>
                    <option>Other</option>
                  </select>
                </label>
                <label className="space-y-1.5">
                  <span className="text-[12px] font-semibold text-ink-700">Region</span>
                  <Input placeholder="South West" />
                </label>
              </div>
              <label className="block space-y-1.5">
                <span className="text-[12px] font-semibold text-ink-700">How can we help?</span>
                <textarea
                  required
                  rows={5}
                  className="min-h-[120px] w-full rounded-[10px] border border-ink-300 bg-white px-3 py-2 text-[13px] text-ink-800 focus:border-green-800 focus:outline-none focus:ring-4 focus:ring-green-800/10"
                  placeholder="Tell us about your farm or sourcing needs"
                />
              </label>
              <div className="flex justify-end">
                <Button type="submit" className="gap-2">
                  Send message
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          )}
        </Card>
      </ContentSection>
    </div>
  );
}
