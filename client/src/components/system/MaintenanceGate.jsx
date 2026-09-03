"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCw } from "lucide-react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/store/authStore";

export function MaintenanceGate() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const [status, setStatus] = useState(null);
  const [pathname, setPathname] = useState("");

  const refresh = useCallback(async () => {
    try {
      const response = await api.get("/system/status", {
        skipPhoneVerificationRedirect: true,
      });
      setStatus(response.data?.data || null);
    } catch {
      // A status probe must not hide the application when the API is unreachable.
    }
  }, []);

  useEffect(() => {
    setPathname(window.location.pathname);
    refresh();
    const interval = window.setInterval(refresh, 30000);
    const handleMaintenance = (event) => {
      setStatus({
        enabled: true,
        message: event.detail?.message,
        startedAt: event.detail?.startedAt,
      });
    };
    window.addEventListener("agriculnet:maintenance", handleMaintenance);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("agriculnet:maintenance", handleMaintenance);
    };
  }, [refresh]);

  if (!status?.enabled) return null;

  const adminOrAuth = pathname.startsWith("/admin") || pathname.startsWith("/auth");
  const handleLogout = async () => {
    await logout();
    router.replace("/auth/login");
  };
  if (adminOrAuth) {
    return (
      <div role="status" className="sticky top-0 z-[80] border-b border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-950">
        Maintenance mode is active. Admin and authentication controls remain available.
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-[#F7FAF7] px-4 py-10">
      <section className="w-full max-w-xl rounded-3xl border border-green-100 bg-white p-7 text-center shadow-xl sm:p-10" aria-labelledby="maintenance-title">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-amber-100 text-amber-800">
          <AlertTriangle aria-hidden="true" className="h-7 w-7" />
        </span>
        <h1 id="maintenance-title" className="mt-6 font-display text-3xl text-green-950 sm:text-4xl">
          Scheduled maintenance
        </h1>
        <p className="mt-4 text-base leading-7 text-ink-600">
          {status.message || "AgriculNet is currently under maintenance. Some functionalities may be temporarily unavailable. Please try again shortly."}
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button className="w-full sm:w-auto" onClick={refresh}>
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            Check again
          </Button>
          {isAuthenticated ? (
            <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={handleLogout}>
              Sign out
            </Button>
          ) : null}
        </div>
      </section>
    </div>
  );
}
