"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";

export function useDashboardAccess({ allowedRoles = [], authRedirect, pathname }) {
  const router = useRouter();
  const {
    clearAuth,
    hydrateSession,
    logout,
    redirectToDashboard,
    user,
  } = useAuth();
  const [ready, setReady] = useState(false);
  const bootstrapPromiseRef = useRef(null);

  useEffect(() => {
    let active = true;

    if (!bootstrapPromiseRef.current) {
      bootstrapPromiseRef.current = (async () => {
        if (user) return { redirect: null };
        const result = await hydrateSession();
        if (!result.success) {
          await clearAuth();
          return { redirect: authRedirect };
        }
        return { redirect: null };
      })();
    }

    bootstrapPromiseRef.current.then(({ redirect }) => {
      if (!active) return;
      if (redirect) router.replace(redirect);
      setReady(true);
    });

    return () => {
      active = false;
    };
  }, [authRedirect, clearAuth, hydrateSession, router, user]);

  useEffect(() => {
    if (!ready || !user) return;

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      router.replace(redirectToDashboard());
      return;
    }

    if (!user.email_verified) {
      const nextRoute = redirectToDashboard();
      if (nextRoute !== pathname) {
        router.replace(nextRoute);
      }
    }
  }, [allowedRoles, pathname, ready, redirectToDashboard, router, user]);

  const logoutAndRedirect = useCallback(async () => {
    await logout();
    router.replace(authRedirect);
  }, [authRedirect, logout, router]);

  return { logoutAndRedirect, ready, user };
}
