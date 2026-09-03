"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function NotificationDeepLinkPage() {
  const router = useRouter();
  const { user, ready } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (!user) return router.replace("/auth/login?next=%2Fnotifications");
    if (["farmer", "reseller"].includes(user.role)) return router.replace("/farmer/notifications");
    if (["admin", "super_admin"].includes(user.role)) return router.replace("/admin/dashboard");
    return router.replace("/buyer/notifications");
  }, [ready, router, user]);

  return <LoadingSpinner fullScreen label="Opening notifications" />;
}
