"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterTabs } from "@/components/common/FilterTabs";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { demoAdminUsers } from "@/lib/demo-data";

const ROLE_OPTIONS = [
  { value: "all", label: "All roles" },
  { value: "farmer", label: "Farmers" },
  { value: "local_buyer", label: "Local buyers" },
  { value: "international_buyer", label: "International buyers" },
];

export default function AdminUsersPage() {
  const [role, setRole] = useState("all");
  const [query, setQuery] = useState("");

  const options = useMemo(() => {
    const counts = { all: demoAdminUsers.length };
    for (const user of demoAdminUsers) {
      counts[user.role] = (counts[user.role] ?? 0) + 1;
    }
    return ROLE_OPTIONS.map((opt) => ({ ...opt, count: counts[opt.value] ?? 0 }));
  }, []);

  const filtered = useMemo(() => {
    let rows = [...demoAdminUsers];
    if (role !== "all") rows = rows.filter((user) => user.role === role);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      rows = rows.filter(
        (user) =>
          user.name.toLowerCase().includes(q) ||
          user.region.toLowerCase().includes(q) ||
          user.role.toLowerCase().includes(q),
      );
    }
    return rows;
  }, [role, query]);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Admin users"
        title="Profiles, roles, and approval state"
        description="Review onboarding outcomes and preview the moderation surfaces that sit on top of the real auth layer."
      />

      <Reveal>
        <div className="rounded-[18px] border border-ink-100 bg-white p-4 shadow-soft">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <FilterTabs options={options} value={role} onChange={setRole} />
            <div className="relative w-full min-w-[220px] md:w-[260px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <Input
                className="pl-9"
                placeholder="Search name, role, or region"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>
          <p className="mt-3 text-[12px] text-ink-500">
            Showing <span className="font-semibold text-ink-800">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "profile" : "profiles"}
          </p>
        </div>
      </Reveal>

      {filtered.length === 0 ? (
        <div className="rounded-[18px] border border-dashed border-ink-200 bg-white p-10 text-center text-ink-500">
          No profiles match these filters.
        </div>
      ) : (
        <Stagger className="grid gap-4">
          {filtered.map((user) => (
            <StaggerItem key={user.id}>
              <Card className="rounded-[18px] p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-display text-[22px] text-ink-900">{user.name}</h2>
                      <StatusBadge
                        status={user.status === "active" ? "verified" : "pending"}
                        label={user.status.replace(/_/g, " ")}
                      />
                      <span className="rounded-full border border-ink-200 bg-ink-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink-600">
                        {user.role.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-[12px] text-ink-500">Region: {user.region}</p>
                  </div>

                  <Link
                    href={`/admin/users/${user.id}`}
                    className="inline-flex items-center gap-2 text-[13px] font-semibold text-green-800 hover:text-green-700"
                  >
                    Open user
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </section>
  );
}
