"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "../../lib/utils";
import useAuth from "../../hooks/useAuth";
import { useI18n } from "../../i18n/I18nProvider";
import { BrandLogo } from "../common/BrandLogo";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { DashboardTopBar } from "./DashboardTopBar";
import { SkipToContent } from "../a11y/SkipToContent";
import { useDashboardData } from "../../hooks/useDashboardData";
import { FarmerButton, farmerDisplayName, farmerInitials } from "../farmer/FarmerDesignSystem";
import { BuyerButton, buyerDisplayName, buyerInitials } from "../buyer/BuyerDesignSystem";
import { ProfilePhotoEditor } from "../account/ProfilePhotoEditor";

function navBadgeCount(item, data) {
  if (!data || item.id === "dashboard" || item.id === "settings" || item.id === "helpSupport") return null;
  const metrics = data.metrics || {};
  const counts = {
    users: metrics.totalUsers,
    listings: metrics.totalListings ?? data.listings?.length,
    orders: metrics.totalOrders ?? data.orders?.length,
    payments: data.payments?.length,
    inspections: data.inspections?.length,
    logistics: data.logistics?.length,
    disputes: metrics.activeDisputes ?? data.disputes?.length,
    analytics: null,
    auditLogs: data.activity?.length,
    addListing: null,
    messages: metrics.unreadMessages ?? data.conversations?.reduce((sum, item) => sum + (item.unread || 0), 0),
    notifications: data.notifications?.filter((item) => item.status !== "verified").length ?? data.notifications?.length,
    profile: null,
    saved: metrics.savedListings ?? data.savedListings?.length,
    browse: null,
    findFarmers: null,
  };
  const value = counts[item.id];
  return typeof value === "number" ? value : null;
}

export function SidebarPanel({ heading, navigation, pathname, resolveLabel, variant = "default", dashboardData, user }) {
  if (variant === "admin") {
    return (
      <aside
        aria-label={`${heading} sidebar`}
        className="sticky top-0 hidden h-screen overflow-y-auto border-r border-green-950 bg-[#0D3D22] px-6 py-7 text-white lg:block"
      >
        <Link
          href="/"
          className="focus-ring flex items-center gap-3 rounded-md bg-white px-3 py-2"
        >
          <BrandLogo className="h-12 w-[190px]" />
        </Link>

        <div className="mt-8 inline-flex rounded-full border border-amber-300 bg-amber-500 px-5 py-2 text-[14px] font-bold text-white">
          Admin Panel
        </div>

        <div className="mt-8 border-t border-white/15 pt-7">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-white/60">Main</p>
          <nav aria-label="Workspace navigation" className="mt-4 space-y-1">
            {navigation.map((item) => {
              const { href, label, id, icon: Icon } = item;
              const active = pathname === href || pathname.startsWith(`${href}/`);
              const text = resolveLabel ? resolveLabel(id, label) : label;
                  const badge = navBadgeCount(item, dashboardData);
              const danger = id === "disputes" && badge > 0;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "focus-ring flex min-h-14 items-center gap-4 rounded-2xl px-4 text-[16px] font-medium transition-all duration-200 motion-safe:hover:translate-x-1",
                    active ? "border-l-4 border-amber-400 bg-white text-[#0D3D22]" : "text-white/80 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{text}</span>
                  {badge !== null ? (
                    <span
                      className={cn(
                        "inline-flex min-w-8 justify-center rounded-full px-2 py-1 text-[12px] font-bold",
                        danger ? "bg-red-100 text-red-800" : "bg-white/15 text-white",
                      )}
                    >
                      {badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-8 border-t border-white/15 pt-7">
          <div className="flex items-center gap-3">
            <ProfilePhotoEditor
              user={user}
              initials="AD"
              displayName="Admin profile photo"
              size="md"
              compact
              avatarClassName="ring-2 ring-white/40"
              buttonClassName="sr-only"
            />
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold text-white">{[user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.email || "Admin User"}</p>
              <p className="text-[13px] text-white/60">{user?.role || "Super Admin"}</p>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  if (variant === "farmer") {
    const profile = dashboardData?.profile || {};
    const listingsCount = dashboardData?.listings?.length || 0;
    const location = [profile.city || user?.city, profile.region || user?.region].filter(Boolean).join(", ") || "Farm location pending";
    const statusText = user?.status === "active" ? "Verified Farmer" : "Verification pending";
    const mainItems = navigation.filter((item) => !["profile", "settings", "helpSupport"].includes(item.id));
    const accountItems = navigation.filter((item) => ["profile", "settings", "helpSupport"].includes(item.id));

    const renderItem = (item) => {
      const { href, label, id, icon: Icon } = item;
      const active = id === "listings"
        ? pathname === href || (pathname.startsWith(`${href}/`) && pathname !== "/farmer/listings/new")
        : pathname === href || pathname.startsWith(`${href}/`);
      const text = resolveLabel ? resolveLabel(id, label) : label;
      const badge = navBadgeCount(item, dashboardData);
      return (
        <Link
          key={href}
          href={href}
          aria-current={active ? "page" : undefined}
          className={cn(
            "focus-ring flex min-h-11 items-center gap-3 rounded-lg px-3 text-[16px] font-medium transition-all duration-200 motion-safe:hover:translate-x-1",
            active ? "border-l-4 border-amber-400 bg-white text-[#0D3D22]" : "text-white/80 hover:bg-white/10 hover:text-white",
          )}
        >
          <Icon className="h-5 w-5 shrink-0" />
          <span className="min-w-0 flex-1 truncate">{text}</span>
          {badge ? (
            <span className={cn(
              "inline-flex min-w-8 justify-center rounded-full px-2 py-1 text-[12px] font-bold",
              id === "orders" || id === "messages" ? "bg-amber-100 text-amber-800" : "bg-white/15 text-white",
            )}>
              {badge}
            </span>
          ) : null}
        </Link>
      );
    };

    return (
      <aside
        aria-label={`${heading} sidebar`}
        className="sticky top-0 hidden h-screen overflow-y-auto border-r border-green-950 bg-[#0D3D22] text-white lg:block"
      >
        <div className="flex min-h-full flex-col">
          <div className="border-b border-white/15 px-7 py-8 text-center">
            <ProfilePhotoEditor
              user={user}
              initials={farmerInitials(user)}
              displayName={farmerDisplayName(user)}
              size="xl"
              avatarClassName="mx-auto h-20 w-20 border-4 border-white/30 text-[26px]"
              buttonClassName="mt-3 inline-flex items-center justify-center gap-2 rounded-lg text-[13px] font-bold text-amber-200 underline-offset-4 hover:underline"
            />
            <h2 className="mt-4 text-[20px] font-bold text-white">{farmerDisplayName(user)}</h2>
            <p className="mt-1 text-[15px] text-white/70">{location}</p>
            <p className="mt-1 text-[15px] text-white/70">{profile.rating ? `${profile.rating} rating` : "Rating pending"}</p>
            <span className="mt-3 inline-flex rounded-full bg-white px-4 py-1.5 text-[14px] font-bold text-[#0D3D22]">
              {statusText}
            </span>
          </div>

          <div className="flex-1 px-6 py-7">
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-white/60">My Farm</p>
            <nav aria-label="Farmer navigation" className="mt-4 space-y-1">
              {mainItems.map(renderItem)}
            </nav>

            <div className="mt-7 border-t border-ink-100 pt-7">
              <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-white/60">Account</p>
              <nav aria-label="Farmer account navigation" className="mt-4 space-y-1">
                {accountItems.map(renderItem)}
              </nav>
            </div>
          </div>

          <div className="border-t border-white/15 p-6">
            <FarmerButton href="/farmer/listings/new" variant="gold" className="w-full">Add New Listing</FarmerButton>
            <p className="mt-3 text-center text-[14px] text-white/60">{listingsCount} active listings</p>
          </div>
        </div>
      </aside>
    );
  }

  if (variant === "buyer") {
    const profile = dashboardData?.profile || {};
    const savedCount = dashboardData?.metrics?.savedListings ?? dashboardData?.savedListings?.length ?? 0;
    const listingsCount = dashboardData?.listings?.length || 0;
    const location = [user?.city, user?.region].filter(Boolean).join(", ") || profile.destination_market || "Sourcing location pending";
    const company = profile.company_name || profile.business_name || "Buyer account";
    const statusText = user?.status === "active" ? "Verified Buyer" : "Verification pending";
    const mainItems = navigation.filter((item) => !["profile", "settings", "helpSupport"].includes(item.id));
    const accountItems = navigation.filter((item) => ["profile", "settings", "helpSupport"].includes(item.id));

    const renderItem = (item) => {
      const { href, label, id, icon: Icon } = item;
      const active = pathname === href || pathname.startsWith(`${href}/`);
      const text = resolveLabel ? resolveLabel(id, label) : label;
      const badge = navBadgeCount(item, dashboardData);
      return (
        <Link
          key={href}
          href={href}
          aria-current={active ? "page" : undefined}
          className={cn(
            "focus-ring flex min-h-11 items-center gap-3 rounded-lg px-3 text-[16px] font-medium transition-all duration-200 motion-safe:hover:translate-x-1",
            active ? "border-l-4 border-amber-400 bg-white text-[#0D3D22]" : "text-white/80 hover:bg-white/10 hover:text-white",
          )}
        >
          <Icon className="h-5 w-5 shrink-0" />
          <span className="min-w-0 flex-1 truncate">{text}</span>
          {badge ? (
            <span className={cn(
              "inline-flex min-w-8 justify-center rounded-full px-2 py-1 text-[12px] font-bold",
              id === "orders" || id === "messages" ? "bg-amber-100 text-amber-800" : "bg-white/15 text-white",
            )}>
              {badge}
            </span>
          ) : null}
        </Link>
      );
    };

    return (
      <aside
        aria-label={`${heading} sidebar`}
        className="sticky top-0 hidden h-screen overflow-y-auto border-r border-green-950 bg-[#0D3D22] text-white lg:block"
      >
        <div className="flex min-h-full flex-col">
          <div className="border-b border-white/15 px-7 py-8 text-center">
            <ProfilePhotoEditor
              user={user}
              initials={buyerInitials(user)}
              displayName={buyerDisplayName(user)}
              size="xl"
              avatarClassName="mx-auto h-20 w-20 border-4 border-white/30 text-[26px]"
              buttonClassName="mt-3 inline-flex items-center justify-center gap-2 rounded-lg text-[13px] font-bold text-amber-200 underline-offset-4 hover:underline"
            />
            <h2 className="mt-4 text-[20px] font-bold text-white">{buyerDisplayName(user)}</h2>
            <p className="mt-1 text-[15px] text-white/70">{location}</p>
            <p className="mt-1 text-[15px] text-white/70">{company}</p>
            <span className="mt-3 inline-flex rounded-full bg-white px-4 py-1.5 text-[14px] font-bold text-[#0D3D22]">
              {statusText}
            </span>
          </div>

          <div className="flex-1 px-6 py-7">
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-white/60">My Sourcing</p>
            <nav aria-label="Buyer navigation" className="mt-4 space-y-1">
              {mainItems.map(renderItem)}
            </nav>

            <div className="mt-7 border-t border-ink-100 pt-7">
              <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-white/60">Account</p>
              <nav aria-label="Buyer account navigation" className="mt-4 space-y-1">
                {accountItems.map(renderItem)}
              </nav>
            </div>
          </div>

          <div className="border-t border-white/15 p-6">
            <BuyerButton href="/browse" variant="gold" className="w-full">Browse Market</BuyerButton>
            <p className="mt-3 text-center text-[14px] text-white/60">{listingsCount || savedCount} active listings available</p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      aria-label={`${heading} sidebar`}
      className="rounded-[18px] border border-[#0F5132] bg-[#0D3D22] p-5 text-white"
    >
      <Link
        href="/"
        className="focus-ring flex items-center gap-3 rounded-md focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D3D22]"
      >
        <div>
          <span className="inline-flex rounded-[10px] bg-white px-2.5 py-1.5">
            <BrandLogo className="h-9 w-[140px]" />
          </span>
          <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#F7EDD5]">{heading}</p>
        </div>
      </Link>

      <nav aria-label="Workspace navigation" className="mt-6 space-y-2">
        {navigation.map(({ href, label, id, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const text = resolveLabel ? resolveLabel(id, label) : label;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "focus-ring flex items-center gap-3 rounded-[12px] px-3 py-2 text-[13px] transition-colors focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D3D22]",
                active ? "bg-white text-[#0D3D22]" : "text-white/78 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{text}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function DashboardShell({ heading, navigation, allowedRoles, authRedirect, description, children, navNamespace = "buyer" }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, hydrateSession, logout, redirectToDashboard } = useAuth();
  const { t } = useI18n();
  const [ready, setReady] = useState(false);
  const isAdminShell = navNamespace === "admin";
  const isFarmerShell = navNamespace === "farmer";
  const isBuyerShell = navNamespace === "buyer";
  const dashboardRole = isAdminShell ? "admin" : isFarmerShell && user?.role === "farmer" ? "farmer" : isBuyerShell ? "buyer" : null;
  const { data: dashboardData } = useDashboardData(dashboardRole);

  const resolveNavLabel = useCallback(
    (id, fallback) => {
      if (!id) return fallback;
      const key = `nav.${navNamespace}.${id}`;
      const translated = t(key);
      return translated === key ? fallback : translated;
    },
    [navNamespace, t],
  );

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      const hasStoredToken = typeof window !== "undefined" && Boolean(localStorage.getItem("agriculnet_access_token"));

      if (!user && hasStoredToken) {
        await hydrateSession();
      }

      if (active) {
        setReady(true);
      }
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, [hydrateSession, user]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    const hasStoredToken = typeof window !== "undefined" && Boolean(localStorage.getItem("agriculnet_access_token"));

    if (!user && !hasStoredToken) {
      router.replace(authRedirect);
      return;
    }

    if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      router.replace(redirectToDashboard());
      return;
    }

    if (user && !user.email_verified) {
      const nextRoute = redirectToDashboard();
      if (nextRoute !== pathname) {
        router.replace(nextRoute);
      }
    }
  }, [allowedRoles, authRedirect, pathname, ready, redirectToDashboard, router, user]);

  const currentItem = useMemo(
    () => navigation.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)),
    [navigation, pathname],
  );

  const handleLogout = async () => {
    await logout();
    router.replace(authRedirect);
  };

  if (!ready) {
    return <LoadingSpinner fullScreen label={t("dashboard.loadingWorkspace")} />;
  }

  if (!user) {
    return <LoadingSpinner fullScreen label={t("dashboard.redirectingSignIn")} />;
  }

  return (
    <div className={cn("min-h-screen", isAdminShell || isFarmerShell || isBuyerShell ? "bg-ink-50" : "bg-[#F6F8F6]")}>
      <SkipToContent />
      <div className={cn(
        "mx-auto grid w-full max-w-none",
        isAdminShell || isFarmerShell || isBuyerShell ? "lg:grid-cols-[300px_minmax(0,1fr)]" : "gap-6 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8 xl:px-10",
      )}>
        <SidebarPanel
          heading={heading}
          navigation={navigation}
          pathname={pathname}
          resolveLabel={resolveNavLabel}
          variant={isAdminShell ? "admin" : isFarmerShell ? "farmer" : isBuyerShell ? "buyer" : "default"}
          dashboardData={dashboardData}
          user={user}
        />
        <main id="main-content" tabIndex={-1} className={cn(isAdminShell || isFarmerShell || isBuyerShell ? "min-w-0 space-y-8 px-4 pb-10 lg:px-8 xl:px-10" : "space-y-6")}>
          <DashboardTopBar
            title={resolveNavLabel(currentItem?.id, currentItem?.label) || heading}
            description={description}
            user={user}
            onLogout={handleLogout}
            variant={isAdminShell ? "admin" : isFarmerShell ? "farmer" : isBuyerShell ? "buyer" : "default"}
            dashboardData={dashboardData}
          />
          <div className={cn(isAdminShell || isFarmerShell || isBuyerShell ? "space-y-8" : "space-y-6")}>{children}</div>
        </main>
      </div>
    </div>
  );
}
