"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "../../lib/utils";
import useAuth from "../../hooks/useAuth";
import { BrandLogo } from "../common/BrandLogo";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { DashboardTopBar } from "./DashboardTopBar";
import { SkipToContent } from "../a11y/SkipToContent";

export function SidebarPanel({ heading, navigation, pathname }) {
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
        {navigation.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
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
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function DashboardShell({ heading, navigation, allowedRoles, authRedirect, description, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, hydrateSession, logout, redirectToDashboard } = useAuth();
  const [ready, setReady] = useState(false);

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
    return <LoadingSpinner fullScreen label="Loading workspace" />;
  }

  if (!user) {
    return <LoadingSpinner fullScreen label="Redirecting to sign in" />;
  }

  return (
    <div className="min-h-screen bg-[#F6F8F6]">
      <SkipToContent />
      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6">
        <SidebarPanel heading={heading} navigation={navigation} pathname={pathname} />
        <main id="main-content" tabIndex={-1} className="space-y-6">
          <DashboardTopBar
            title={currentItem?.label || heading}
            description={description}
            user={user}
            onLogout={handleLogout}
          />
          <div className="space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
