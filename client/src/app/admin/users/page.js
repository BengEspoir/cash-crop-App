"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterTabs } from "@/components/common/FilterTabs";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDashboardData } from "@/hooks/useDashboardData";

const ROLE_OPTIONS = [
  { value: "all", label: "All roles" },
  { value: "farmer", label: "Farmers" },
  { value: "local_buyer", label: "Local buyers" },
  { value: "international_buyer", label: "International buyers" },
  { value: "admin", label: "Admins" },
];

export default function AdminUsersPage() {
  const [role, setRole] = useState("all");
  const [query, setQuery] = useState("");
  const { data, isLoading } = useDashboardData("admin");
  const users = useMemo(() => data?.users || [], [data?.users]);

  const options = useMemo(() => {
    const counts = { all: users.length };
    for (const user of users) {
      counts[user.role] = (counts[user.role] ?? 0) + 1;
    }
    return ROLE_OPTIONS.map((opt) => ({ ...opt, count: counts[opt.value] ?? 0 }));
  }, [users]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = role === "all" || user.role === role;
      const matchesQuery = !q || [user.name, user.email, user.phone, user.region, user.role]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
      return matchesRole && matchesQuery;
    });
  }, [role, query, users]);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Admin users"
        title="Profiles, roles, and approval state"
        description="Live user records from the database. New registrations and review decisions appear here."
      />

      <Card className="rounded-[18px] p-4 shadow-soft">
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
          Showing <span className="font-semibold text-ink-800">{filtered.length}</span> live profiles
        </p>
      </Card>

      {isLoading ? (
        <Card className="rounded-[16px] p-8 text-center text-ink-500">Loading live users...</Card>
      ) : filtered.length ? (
        <div className="grid gap-4">
          {filtered.map((user) => (
            <Card key={user.id} className="rounded-[18px] p-5 shadow-soft">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-display text-[22px] text-ink-900">{user.name}</h2>
                    <StatusBadge status={user.status === "active" ? "verified" : user.status === "rejected" ? "rejected" : "pending"} label={user.status?.replace(/_/g, " ")} />
                    <span className="rounded-full border border-ink-200 bg-ink-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink-600">
                      {user.role?.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-[12px] text-ink-500">
                    {[user.email, user.phone, user.region || user.country].filter(Boolean).join(" | ") || "Contact details pending"}
                  </p>
                </div>

                <Link href={`/admin/users/${user.id}`} className="inline-flex items-center gap-2 text-[13px] font-semibold text-green-800 hover:text-green-700">
                  Open user
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No live users match these filters"
          description="Registered users will appear here once the system starts receiving real accounts."
        />
      )}
    </section>
  );
}
