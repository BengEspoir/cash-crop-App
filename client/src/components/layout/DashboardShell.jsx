"use client";

import { useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";
import { useI18n } from "../../i18n/I18nProvider";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { DashboardTopBar } from "./DashboardTopBar";
import { SkipToContent } from "../a11y/SkipToContent";
import { useDashboardData } from "../../hooks/useDashboardData";
import { MobileDashboardNav, SidebarPanel } from "./DashboardNavigation";
import { useDashboardAccess } from "../../hooks/useDashboardAccess";

export { SidebarPanel } from "./DashboardNavigation";

export function DashboardShell({ heading, navigation, allowedRoles, authRedirect, description, children, navNamespace = "buyer" }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const { logoutAndRedirect, ready, user } = useDashboardAccess({ allowedRoles, authRedirect, pathname });
  const isAdminShell = navNamespace === "admin";
  const isFarmerShell = navNamespace === "farmer";
  const isBuyerShell = navNamespace === "buyer";
  const dashboardRole = ready && user
    ? isAdminShell
      ? "admin"
      : isFarmerShell && ["farmer", "reseller"].includes(user.role)
        ? "farmer"
        : isBuyerShell
          ? "buyer"
          : null
    : null;
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

  const currentItem = useMemo(
    () => navigation.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)),
    [navigation, pathname],
  );

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
            onLogout={logoutAndRedirect}
            variant={isAdminShell ? "admin" : isFarmerShell ? "farmer" : isBuyerShell ? "buyer" : "default"}
            dashboardData={dashboardData}
          />
          {(isAdminShell || isFarmerShell || isBuyerShell) ? (
            <MobileDashboardNav
              heading={heading}
              navigation={navigation}
              pathname={pathname}
              resolveLabel={resolveNavLabel}
              dashboardData={dashboardData}
            />
          ) : null}
          <div className={cn(isAdminShell || isFarmerShell || isBuyerShell ? "space-y-8" : "space-y-6")}>{children}</div>
        </main>
      </div>
    </div>
  );
}
