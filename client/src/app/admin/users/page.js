"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterTabs } from "@/components/common/FilterTabs";
import { TierBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDashboardData } from "@/hooks/useDashboardData";
import { cn } from "@/lib/utils";
import { AdminUserReviewDrawer } from "@/components/admin/AdminUserReviewDrawer";

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
  const [drawerUser, setDrawerUser] = useState(null);
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
        <div className="grid gap-3">
          {filtered.map((user) => {
            const statusMap = {
              active: "verified",
              rejected: "rejected",
              pending_review: "pending",
              pending_verification: "pending_verification",
              pending_identity_verification: "pending_verification",
            };
            const badgeStatus = statusMap[user.status] || "pending_verification";

            return (
              <Card
                key={user.id}
                variant="interactive"
                className="rounded-[18px] p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-[20px] text-ink-900">{user.name}</h2>
                      <TierBadge status={badgeStatus} size="sm" />
                      <span className="rounded-full border border-ink-200 bg-ink-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-600">
                        {user.role?.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-[12px] text-ink-500">
                      {[user.email, user.phone, user.region || user.country].filter(Boolean).join(" | ") || "Contact details pending"}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-[13px] font-semibold text-ink-800 transition-colors hover:border-green-300 hover:bg-green-50/80"
                      onClick={() => setDrawerUser(user)}
                    >
                      Quick review
                    </button>
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-semibold text-green-800 transition-colors hover:bg-green-50"
                    >
                      Open user
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No live users match these filters"
          description="Registered users will appear here once the system starts receiving real accounts."
        />
      )}

      <AdminUserReviewDrawer user={drawerUser} open={Boolean(drawerUser)} onClose={() => setDrawerUser(null)} />
    </section>
  );
}
