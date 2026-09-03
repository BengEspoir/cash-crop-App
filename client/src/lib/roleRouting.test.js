import { describe, expect, it } from "vitest";
import {
  isMarketplacePath,
  getRoleHome,
  resolveAuthUserRole,
  shouldRedirectSellerFromMarketplace,
  shouldRedirectWorkspaceRoleFromMarketplace,
} from "@/lib/roleRouting";

describe("role routing", () => {
  it("resolves a trusted role from Supabase app metadata", () => {
    expect(resolveAuthUserRole({ app_metadata: { user_role: "reseller" } })).toBe("reseller");
    expect(resolveAuthUserRole({ app_metadata: { role: "admin" } })).toBe("admin");
  });

  it("accepts only self-selected roles from user metadata", () => {
    expect(resolveAuthUserRole({ user_metadata: { requested_role: "farmer" } })).toBe("farmer");
    expect(resolveAuthUserRole({ user_metadata: { requested_role: "admin" } })).toBeNull();
  });

  it("keeps sellers inside their seller workspace while authenticated", () => {
    expect(shouldRedirectSellerFromMarketplace("/browse", "farmer")).toBe(true);
    expect(shouldRedirectSellerFromMarketplace("/crops/cocoa-1", "reseller")).toBe(true);
    expect(shouldRedirectSellerFromMarketplace("/browse", "local_buyer")).toBe(false);
    expect(shouldRedirectSellerFromMarketplace("/farmer/listings", "farmer")).toBe(false);
  });

  it("keeps administrators in the admin workspace while buyers retain marketplace access", () => {
    expect(shouldRedirectWorkspaceRoleFromMarketplace("/browse", "admin")).toBe(true);
    expect(shouldRedirectWorkspaceRoleFromMarketplace("/crops/cocoa-1", "super_admin")).toBe(true);
    expect(shouldRedirectWorkspaceRoleFromMarketplace("/browse", "local_buyer")).toBe(false);
    expect(getRoleHome("reseller")).toBe("/farmer/dashboard");
    expect(getRoleHome("admin")).toBe("/admin/dashboard");
  });

  it("recognizes the public marketplace surfaces", () => {
    expect(isMarketplacePath("/")).toBe(true);
    expect(isMarketplacePath("/sell/onboarding")).toBe(true);
    expect(isMarketplacePath("/about")).toBe(false);
  });
});
