const APP_ROLES = new Set([
  "super_admin",
  "admin",
  "field_agent",
  "farmer",
  "reseller",
  "local_buyer",
  "international_buyer",
]);

const SELF_SELECTED_ROLES = new Set([
  "farmer",
  "reseller",
  "local_buyer",
  "international_buyer",
]);

const MARKETPLACE_PATHS = [
  "/browse",
  "/crops",
  "/farmers",
  "/find-farmers",
  "/request-quote",
  "/international",
  "/sell",
];

export function resolveAuthUserRole(authUser) {
  const trustedRole = authUser?.app_metadata?.user_role ?? authUser?.app_metadata?.role;
  if (APP_ROLES.has(trustedRole)) return trustedRole;

  const requestedRole = authUser?.user_metadata?.requested_role ?? authUser?.user_metadata?.role;
  return SELF_SELECTED_ROLES.has(requestedRole) ? requestedRole : null;
}

export function isSellerRole(role) {
  return role === "farmer" || role === "reseller";
}

export function isMarketplacePath(pathname) {
  if (pathname === "/") return true;
  return MARKETPLACE_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function shouldRedirectSellerFromMarketplace(pathname, role) {
  return isSellerRole(role) && isMarketplacePath(pathname);
}

