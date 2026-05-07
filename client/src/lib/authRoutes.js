export function getRoleDashboard(user) {
  switch (user?.role) {
    case "farmer":
      return "/farmer/dashboard";
    case "local_buyer":
    case "international_buyer":
      return "/buyer/dashboard";
    case "admin":
    case "super_admin":
      return "/admin/dashboard";
    case "field_agent":
      return "/agent/dashboard";
    default:
      return "/";
  }
}

export function getAuthNextRoute(nextStep, user) {
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
      return getRoleDashboard(user);
    case "sign_in":
      return "/sign-in";
    default:
      return getRoleDashboard(user);
  }
}
