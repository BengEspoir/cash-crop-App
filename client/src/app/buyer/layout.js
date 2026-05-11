"use client";

import { DashboardShell } from "../../components/layout/DashboardShell";
import { buyerNavigation } from "../../constants/routes";

export default function BuyerRouteLayout({ children }) {
  return (
    <DashboardShell
      heading="Buyer Workspace"
      navNamespace="buyer"
      navigation={buyerNavigation}
      allowedRoles={["local_buyer", "international_buyer"]}
      authRedirect="/sign-in"
      description="Review protected orders, buyer messages, and sourcing documents from one clean workspace."
    >
      {children}
    </DashboardShell>
  );
}
