"use client";

import { DashboardShell } from "../../components/layout/DashboardShell";
import { adminNavigation } from "../../constants/routes";

export default function AdminRouteLayout({ children }) {
  return (
    <DashboardShell
      heading="Admin Operations"
      navNamespace="admin"
      navigation={adminNavigation}
      allowedRoles={["admin", "super_admin"]}
      authRedirect="/admin-portal"
      description="Keep reviews, protected trade operations, and marketplace oversight in sync."
    >
      {children}
    </DashboardShell>
  );
}
