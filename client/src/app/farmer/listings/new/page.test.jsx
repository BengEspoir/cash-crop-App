import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FarmerNewListingPage from "./page";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  mutateAsync: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("react-hot-toast", () => ({
  default: { success: mocks.toastSuccess, error: mocks.toastError },
}));
vi.mock("@/hooks/useListings", () => ({
  useCreateListing: () => ({ mutateAsync: mocks.mutateAsync, isPending: false }),
}));
vi.mock("@/components/media/ImageUploader", () => ({
  ImageUploader: () => <div>Image uploader</div>,
}));
vi.mock("@/components/common/AudioAssistButton", () => ({
  AudioAssistButton: ({ label }) => <button type="button" aria-label={label}>Audio help</button>,
}));
vi.mock("@/components/farmer/FarmerDesignSystem", () => ({
  FarmerPage: ({ children }) => <main>{children}</main>,
  FarmerHeader: ({ title, description }) => <header><h1>{title}</h1><p>{description}</p></header>,
  FarmerPanel: ({ children }) => <section>{children}</section>,
  FarmerButton: ({ children, icon: _icon, href, ...props }) => href
    ? <a href={href}>{children}</a>
    : <button type="button" {...props}>{children}</button>,
}));

describe("farmer listing wizard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    window.scrollTo = vi.fn();
    Object.defineProperty(window.navigator, "onLine", { configurable: true, value: true });
  });

  it("uses accessible crop cards and caches step progress locally", async () => {
    const user = userEvent.setup();
    render(<FarmerNewListingPage />);

    const cocoa = screen.getByRole("button", { name: /cocoa/i });
    expect(cocoa).toHaveAttribute("aria-pressed", "false");
    await user.click(cocoa);
    expect(cocoa).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByLabelText("Step 2 of 4")).toBeInTheDocument();
    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem("agriculnet.active-listing-draft.v1"));
      expect(saved).toMatchObject({ step: 2, form: { crop: "Cocoa" } });
    });
  });

  it("restores an interrupted mobile session from local storage", async () => {
    window.localStorage.setItem("agriculnet.active-listing-draft.v1", JSON.stringify({
      step: 3,
      form: {
        crop: "Coffee",
        quantity: "12",
        quantityUnit: "MT",
        price: "3200",
        region: "Kumba, South West",
      },
      gallery: [],
    }));

    render(<FarmerNewListingPage />);
    expect(await screen.findByLabelText("Step 3 of 4")).toBeInTheDocument();
    expect(screen.getByDisplayValue("3200")).toBeInTheDocument();
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Your saved listing progress was restored.");
  });
});
