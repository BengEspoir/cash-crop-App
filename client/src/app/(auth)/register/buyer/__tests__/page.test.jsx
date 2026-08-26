import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RegisterBuyerPage from "../page";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  registerBuyer: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, replace: mocks.replace }),
}));

vi.mock("@/store/authStore", () => ({
  default: () => ({ registerBuyer: mocks.registerBuyer }),
}));

vi.mock("@/lib/startOAuth", () => ({
  startOAuth: vi.fn(),
}));

describe("buyer registration stages", () => {
  beforeEach(() => vi.clearAllMocks());

  it("keeps local social signup on selection and opens the local profile form", async () => {
    const user = userEvent.setup();
    render(<RegisterBuyerPage />);

    expect(screen.getByRole("button", { name: /google/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /apple/i })).toBeInTheDocument();
    expect(screen.queryByText(/preferred crops|commodity preferences/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /continue to profile/i }));

    expect(screen.getByRole("heading", { name: "Complete Your Onboarding" })).toBeInTheDocument();
    expect(screen.getAllByDisplayValue("Cameroon").find((element) => element.type !== "hidden")).toBeDisabled();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("uses an email-based international profile with an explicit country field", async () => {
    const user = userEvent.setup();
    render(<RegisterBuyerPage />);

    await user.click(screen.getByRole("radio", { name: /international buyer/i }));
    expect(screen.queryByRole("button", { name: /google/i })).not.toBeInTheDocument();
    expect(screen.getByText(/international registration uses email/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /continue to profile/i }));

    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText(/accurate country and contact details/i)).toBeInTheDocument();
    expect(screen.queryByText(/preferred crops|commodity preferences/i)).not.toBeInTheDocument();
  });
});
