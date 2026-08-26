import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SellerPreferencesPage from "../page";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  syncOnboarding: vi.fn(),
  setOnboarding: vi.fn(),
  state: {
    onboarding: {
      role: "farmer",
      nextStep: "verify_email",
      pendingProfile: { cooperative_name: "Meme Farmers" },
    },
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, replace: mocks.replace }),
}));

vi.mock("@/store/authStore", () => ({
  default: (selector) => selector({
    ...mocks.state,
    syncOnboarding: mocks.syncOnboarding,
    setOnboarding: mocks.setOnboarding,
  }),
}));

describe("seller registration preferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.state.onboarding = {
      role: "farmer",
      nextStep: "verify_email",
      pendingProfile: { cooperative_name: "Meme Farmers" },
    };
  });

  it("supports keyboard selection and persists farmer crops before verification", async () => {
    const user = userEvent.setup();
    render(<SellerPreferencesPage />);

    expect(await screen.findByText("Select the primary commodities you plan to sell or supply. We'll tailor your feed to these interests.")).toBeInTheDocument();
    const cocoa = screen.getByRole("button", { name: /cocoa/i });
    cocoa.focus();
    await user.keyboard("{Enter}");
    expect(cocoa).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: /save preferences/i }));

    expect(mocks.setOnboarding).toHaveBeenCalledWith({
      pendingProfile: {
        cooperative_name: "Meme Farmers",
        primary_crop: "Cocoa",
        crops_grown: ["Cocoa"],
      },
      sellerPreferencesComplete: true,
    });
    expect(mocks.push).toHaveBeenCalledWith("/verify-email");
  });

  it("skips without inventing crop data and still continues to verification", async () => {
    const user = userEvent.setup();
    render(<SellerPreferencesPage />);

    await user.click(await screen.findByRole("button", { name: "Skip for now... proceed to dashboard" }));

    expect(mocks.setOnboarding).toHaveBeenCalledWith({ sellerPreferencesComplete: true });
    expect(mocks.push).toHaveBeenCalledWith("/verify-email");
  });
});
