"use client";

import { Bell, LockKeyhole, Percent, ShieldCheck } from "lucide-react";
import {
  AdminCard,
  AdminIconTile,
  AdminPageHeader,
} from "@/components/admin/AdminDesignSystem";
import { Input } from "@/components/ui/input";

export default function AdminSettingsPage() {
  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="System Settings"
        eyebrow="Admin > System > Settings"
        description="Operational controls are presented as UI controls only in this pass. No live configuration writes are performed."
        actionLabel={null}
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <AdminIconTile
          icon={ShieldCheck}
          tone="green"
          title="Role Protection"
          description="Admin routes remain protected by authenticated backend role checks."
        />
        <AdminIconTile
          icon={LockKeyhole}
          tone="blue"
          title="Secure Admin Lane"
          description="The hidden admin access route continues to use the configured server secret."
        />
        <AdminIconTile
          icon={Bell}
          tone="gold"
          title="Notification Controls"
          description="Dashboard preference storage is available for role-specific notification defaults."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <AdminCard title="Access Controls">
          <div className="grid gap-5 p-6">
            <label className="space-y-2">
              <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink-400">Admin route secret label</span>
              <Input placeholder="Configured server route" autoComplete="off" />
            </label>
            <label className="flex items-center justify-between gap-4 rounded-2xl border border-ink-100 bg-ink-50 p-4">
              <span className="font-medium text-ink-800">Require role check before workspace access</span>
              <input type="checkbox" defaultChecked className="h-5 w-5 accent-green-800" />
            </label>
            <label className="flex items-center justify-between gap-4 rounded-2xl border border-ink-100 bg-ink-50 p-4">
              <span className="font-medium text-ink-800">Log admin review actions</span>
              <input type="checkbox" defaultChecked className="h-5 w-5 accent-green-800" />
            </label>
          </div>
        </AdminCard>

        <AdminCard title="Commission Display">
          <div className="grid gap-5 p-6">
            <div className="flex items-center gap-4 rounded-2xl border border-gold-100 bg-gold-50 p-5">
              <Percent className="h-8 w-8 text-gold-800" />
              <div>
                <p className="font-bold text-ink-900">Base commission</p>
                <p className="text-[13px] text-ink-500">Displayed for admin review only until config persistence is added.</p>
              </div>
            </div>
            <Input placeholder="5%" autoComplete="off" />
          </div>
        </AdminCard>
      </div>
    </section>
  );
}
