import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminPortalPage from "@/app/(auth)/admin-portal/page";

const redirect = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({ redirect }));

describe("AdminPortalPage", () => {
  beforeEach(() => redirect.mockReset());

  it("keeps the dedicated admin entry path while using canonical Supabase login", () => {
    AdminPortalPage();
    expect(redirect).toHaveBeenCalledWith("/auth/login?next=%2Fadmin%2Fdashboard");
  });
});
