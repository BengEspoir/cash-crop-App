import { getRoleHome, shouldRedirectWorkspaceRoleFromMarketplace } from "@/lib/roleRouting";

export function getRoleDashboard(user) {
  return getRoleHome(user?.role);
}

export function getSafeReturnPath(value) {
  if (!value || !String(value).startsWith("/") || String(value).startsWith("//")) return null;

  try {
    const url = new URL(String(value), "https://agriculnet.local");
    if (url.origin !== "https://agriculnet.local") return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function getLoginRoute(returnTo) {
  const safeReturnTo = getSafeReturnPath(returnTo);
  return safeReturnTo ? `/auth/login?next=${encodeURIComponent(safeReturnTo)}` : "/auth/login";
}

export function getPhoneVerificationRoute(returnTo) {
  const params = new URLSearchParams({ reason: "marketplace-action" });
  const safeReturnTo = getSafeReturnPath(returnTo);
  if (safeReturnTo) params.set("next", safeReturnTo);
  return `/verify-phone?${params.toString()}`;
}

export function getAuthNextRoute(nextStep, user, returnTo) {
  const safeReturnTo = getSafeReturnPath(returnTo);

  if (nextStep === "dashboard" && !user?.email_verified) return "/verify-email";
  switch (nextStep) {
    case "verify_phone":
      return "/verify-phone";
    case "verify_email":
      return "/verify-email";
    case "verify_identity":
      return "/farmer/verify-identity";
    case "pending_review":
      return "/pending";
    case "dashboard":
      if (safeReturnTo && !shouldRedirectWorkspaceRoleFromMarketplace(safeReturnTo, user?.role)) return safeReturnTo;
      if (user?.role === "local_buyer" || user?.role === "international_buyer") {
        return "/browse";
      }
      return getRoleDashboard(user);
    case "sign_in":
      return "/auth/login";
    default:
      return getRoleDashboard(user);
  }
}
