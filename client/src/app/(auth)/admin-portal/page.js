import { redirect } from "next/navigation";

export default function AdminPortalPage() {
  redirect("/auth/login?next=%2Fadmin%2Fdashboard&mode=email");
}
