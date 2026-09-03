import { describe, expect, it } from "vitest";
import {
  getAuthNextRoute,
  getLoginRoute,
  getPhoneVerificationRoute,
  getSafeReturnPath,
} from "@/lib/authRoutes";

describe("auth return routes", () => {
  it("preserves safe internal destinations", () => {
    expect(getSafeReturnPath("/crops/coffee-1?tab=quality")).toBe("/crops/coffee-1?tab=quality");
    expect(getLoginRoute("/farmers/farmer-1")).toBe("/auth/login?next=%2Ffarmers%2Ffarmer-1");
  });

  it("rejects protocol-relative and external destinations", () => {
    expect(getSafeReturnPath("//malicious.example/path")).toBeNull();
    expect(getSafeReturnPath("https://malicious.example/path")).toBeNull();
    expect(getLoginRoute("//malicious.example/path")).toBe("/auth/login");
  });

  it("allows an email-verified user to reach the requested destination before phone verification", () => {
    const user = { role: "local_buyer", email_verified: true, phone_verified: false };
    expect(getAuthNextRoute("dashboard", user, "/crops/coffee-1")).toBe("/crops/coffee-1");
  });

  it("does not let seller or admin return paths override their workspace destination", () => {
    expect(getAuthNextRoute("dashboard", { role: "farmer", email_verified: true }, "/browse")).toBe("/farmer/dashboard");
    expect(getAuthNextRoute("dashboard", { role: "admin", email_verified: true }, "/crops/cocoa-1")).toBe("/admin/dashboard");
  });

  it("preserves a safe return path for action-triggered phone verification", () => {
    expect(getPhoneVerificationRoute("/buyer/checkout?listing=coffee-1")).toBe(
      "/verify-phone?reason=marketplace-action&next=%2Fbuyer%2Fcheckout%3Flisting%3Dcoffee-1",
    );
  });
});
