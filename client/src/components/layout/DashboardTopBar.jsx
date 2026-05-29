"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, HelpCircle, LogOut, RefreshCw, Search } from "lucide-react";
import { Button } from "../ui/button";
import { farmerDisplayName, farmerInitials } from "../farmer/FarmerDesignSystem";
import { buyerDisplayName, buyerInitials } from "../buyer/BuyerDesignSystem";
import { MediaAvatar } from "../media/Avatar";
import { ProfilePhotoEditor } from "../account/ProfilePhotoEditor";
import { CountrySelector } from "../common/CountrySelector";
import { useI18n } from "../../i18n/I18nProvider";

function displayDate() {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function TopbarIconLink({ href, label, icon: Icon, count }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="focus-ring relative rounded-full p-2 text-ink-500 transition-all duration-200 hover:bg-ink-100 hover:text-green-800 motion-safe:hover:-translate-y-0.5"
    >
      <Icon className="h-6 w-6" />
      {count ? (
        <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-700 px-1 text-[11px] font-bold text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

function DashboardSearch({ placeholder, target }) {
  const [query, setQuery] = useState("");

  const submit = (event) => {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    const params = new URLSearchParams();
    params.set("q", q);
    const currentCountry = new URLSearchParams(window.location.search).get("country");
    if (currentCountry) params.set("country", currentCountry);
    window.location.assign(`${target}?${params.toString()}`);
  };

  return (
    <form onSubmit={submit} className="relative min-w-0 max-w-3xl flex-1 xl:w-[520px] xl:flex-none">
      <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className="h-14 w-full rounded-full border border-ink-200 bg-ink-50 pl-14 pr-5 text-[16px] text-ink-800 outline-none transition focus:border-green-700 focus:bg-white focus:ring-4 focus:ring-green-800/10"
      />
    </form>
  );
}

function AccountMenu({
  initials,
  name,
  onLogout,
  profileHref,
  profileLabel = "Profile",
  settingsHref,
  toneClass = "bg-green-800",
  user,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="focus-ring flex items-center gap-3 rounded-full p-1.5 pr-3 transition-all duration-200 hover:bg-ink-100 motion-safe:hover:-translate-y-0.5"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MediaAvatar src={user?.profile_image_url} alt={name || profileLabel} initials={initials} size="md" className={toneClass} />
        {name ? <span className="hidden max-w-[180px] truncate text-[16px] font-bold text-ink-950 md:inline">{name}</span> : null}
        <ChevronDown className={`h-4 w-4 text-ink-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+12px)] z-50 w-64 overflow-hidden rounded-2xl border border-ink-200 bg-white py-2 shadow-xl shadow-ink-900/10 motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95"
        >
          {profileHref ? (
            <Link
              href={profileHref}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-[14px] font-semibold text-ink-700 transition hover:bg-green-50 hover:text-green-800"
            >
              {profileLabel}
            </Link>
          ) : null}
          {settingsHref ? (
            <Link
              href={settingsHref}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-[14px] font-semibold text-ink-700 transition hover:bg-green-50 hover:text-green-800"
            >
              Settings
            </Link>
          ) : null}
          <div className="border-t border-ink-100 px-4 py-3">
            <ProfilePhotoEditor
              user={user}
              initials={initials}
              displayName={name || profileLabel}
              size="sm"
              compact
              buttonClassName="inline-flex items-center gap-2 text-[14px] font-semibold text-green-800 hover:text-green-700"
            />
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={onLogout}
            className="flex w-full items-center gap-2 border-t border-ink-100 px-4 py-3 text-left text-[14px] font-semibold text-red-700 transition hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function DashboardTopBar({ title, description, user, onLogout, variant = "default", dashboardData }) {
  const { t } = useI18n();

  const syncCountryFilter = (code) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("country", code);
    window.location.assign(url.toString());
  };

  if (variant === "admin") {
    const initials = [user?.first_name, user?.last_name]
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD";

    return (
      <header className="sticky top-0 z-30 -mx-4 border-b border-ink-200 bg-white/95 px-4 py-5 backdrop-blur lg:-mx-8 lg:px-8 xl:-mx-10 xl:px-10">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="break-words font-display text-[28px] font-bold leading-none tracking-normal text-ink-900 sm:text-[30px]">{title}</h1>
            <p className="mt-2 break-words text-[15px] text-ink-400 sm:text-[17px]">Admin &gt; {title}</p>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-4">
            <DashboardSearch placeholder={t("dashboard.searchAdmin")} target="/admin/users" />

            <TopbarIconLink href="/admin/help-support" label="Help and support" icon={HelpCircle} />
            <TopbarIconLink href="/admin/audit-logs" label="Notifications and audit logs" icon={Bell} count={dashboardData?.activity?.length || 0} />
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="focus-ring rounded-full p-2 text-ink-500 transition-all duration-200 hover:bg-ink-100 hover:text-green-800 motion-safe:hover:-translate-y-0.5"
              aria-label="Refresh dashboard"
            >
              <RefreshCw className="h-6 w-6" />
            </button>
            <span className="hidden h-10 w-px bg-ink-200 md:block" />
            <span className="text-[16px] font-medium text-ink-500">{displayDate()}</span>
            <AccountMenu
              initials={initials}
              onLogout={onLogout}
              profileHref="/admin/users"
              profileLabel="Admin users"
              settingsHref="/admin/settings"
              toneClass="bg-[#5547BF]"
              user={user}
            />
          </div>
        </div>
        {description ? <p className="sr-only">{description}</p> : null}
      </header>
    );
  }

  if (variant === "farmer") {
    const unreadNotifications = dashboardData?.notifications?.filter((item) => item.status !== "verified").length || 0;
    const verified = user?.status === "active";

    return (
      <header className="sticky top-0 z-30 -mx-4 border-b border-ink-200 bg-white/95 px-4 py-4 backdrop-blur lg:-mx-8 lg:px-8 xl:-mx-10 xl:px-10">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <DashboardSearch placeholder={t("dashboard.searchFarmer")} target="/farmer/listings" />

          <div className="flex min-w-0 flex-wrap items-center gap-4 sm:gap-5">
            <TopbarIconLink href="/farmer/help-support" label="Help and support" icon={HelpCircle} />
            <TopbarIconLink href="/farmer/notifications" label="Notifications" icon={Bell} count={unreadNotifications} />
            <span className="hidden h-10 w-px bg-ink-200 md:block" />
            <AccountMenu
              initials={farmerInitials(user)}
              name={farmerDisplayName(user)}
              onLogout={onLogout}
              profileHref="/farmer/profile"
              settingsHref="/farmer/settings"
              toneClass="bg-green-800"
              user={user}
            />
            <span className="inline-flex h-10 items-center gap-2 rounded-full bg-green-100 px-5 text-[15px] font-bold text-green-800">
              <span className="h-2 w-2 rounded-full bg-green-800" />
              {verified ? "Verified Farmer" : "Verification Pending"}
            </span>
          </div>
        </div>
        {title || description ? <p className="sr-only">{description || title}</p> : null}
      </header>
    );
  }

  if (variant === "buyer") {
    const unreadNotifications = dashboardData?.notifications?.filter((item) => item.status !== "verified").length || 0;
    const verified = user?.status === "active";

    return (
      <header className="sticky top-0 z-30 -mx-4 border-b border-ink-200 bg-white/95 px-4 py-4 backdrop-blur lg:-mx-8 lg:px-8 xl:-mx-10 xl:px-10">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <CountrySelector
            compact
            label={t("dashboard.selectedCountry")}
            onChange={syncCountryFilter}
            className="hidden xl:inline-flex"
          />

          <DashboardSearch placeholder={t("dashboard.searchBuyer")} target="/buyer/orders" />

          <div className="flex min-w-0 flex-wrap items-center gap-4 sm:gap-5">
            <TopbarIconLink href="/buyer/help-support" label="Help and support" icon={HelpCircle} />
            <TopbarIconLink href="/buyer/notifications" label="Notifications" icon={Bell} count={unreadNotifications} />
            <span className="hidden h-10 w-px bg-ink-200 md:block" />
            <AccountMenu
              initials={buyerInitials(user)}
              name={buyerDisplayName(user)}
              onLogout={onLogout}
              profileHref="/buyer/profile"
              settingsHref="/buyer/settings"
              toneClass="bg-amber-600"
              user={user}
            />
            <span className="inline-flex h-10 items-center gap-2 rounded-full bg-green-100 px-5 text-[15px] font-bold text-green-800">
              <span className="h-2 w-2 rounded-full bg-green-800" />
              {verified ? "Verified Buyer" : "Verification Pending"}
            </span>
          </div>
        </div>
        {title || description ? <p className="sr-only">{description || title}</p> : null}
      </header>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-[18px] border border-[#E5E7EB] bg-white px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-1">
        <p className="section-eyebrow">Workspace</p>
        <h1 className="font-display text-[22px] leading-[1.15] text-[#111827]">{title}</h1>
        {description ? <p className="text-[13px] leading-6 text-[#374151]">{description}</p> : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-full bg-[#F3F4F6] px-3 py-2 text-[12px] text-[#374151]">
          Signed in as <span className="font-semibold text-[#111827]">{user?.first_name || user?.email || "AgriculNet user"}</span>
        </div>
        <Button type="button" variant="outline" onClick={onLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
