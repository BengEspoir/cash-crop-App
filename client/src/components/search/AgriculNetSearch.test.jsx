import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AgriculNetSearch } from "./AgriculNetSearch";

const mocks = vi.hoisted(() => ({
  auth: { user: null, isAuthenticated: false },
  ai: vi.fn(),
  image: vi.fn(),
  transcribe: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
  cancel: vi.fn(),
  voice: {
    status: "idle",
    seconds: 0,
    error: "",
    isRecording: false,
    start: vi.fn(),
    stop: vi.fn(),
    cancel: vi.fn(),
  },
}));

vi.mock("@/store/authStore", () => ({
  useAuth: () => mocks.auth,
}));
vi.mock("@/hooks/useMarketplaceSearch", () => ({
  useMarketplaceSearch: () => ({
    aiSearch: { mutateAsync: mocks.ai, isPending: false, error: null },
    imageSearch: { mutateAsync: mocks.image, isPending: false, error: null },
    transcribe: { mutateAsync: mocks.transcribe, isPending: false, error: null },
  }),
}));
vi.mock("@/hooks/useSearchHistory", () => ({
  useSearchHistory: () => ({ history: [], remember: vi.fn(), clear: vi.fn() }),
}));
vi.mock("@/hooks/useVoiceRecorder", () => ({
  useVoiceRecorder: () => mocks.voice,
}));
vi.mock("browser-image-compression", () => ({ default: vi.fn(file => Promise.resolve(file)) }));
vi.mock("next/image", () => ({
  default: () => null,
}));

describe("AgriculNetSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.user = null;
    mocks.auth.isAuthenticated = false;
    mocks.voice.status = "idle";
    mocks.voice.seconds = 0;
    mocks.voice.error = "";
    mocks.voice.isRecording = false;
    mocks.voice.start = vi.fn();
    mocks.voice.stop = vi.fn();
    mocks.voice.cancel = vi.fn();
  });

  it("keeps standard text search available to guests", () => {
    const onStandardSearch = vi.fn();
    render(<AgriculNetSearch onStandardSearch={onStandardSearch} />);

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "cocoa in Kumba" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search marketplace" }));

    expect(onStandardSearch).toHaveBeenCalledWith("cocoa in Kumba");
  });

  it("asks guests to authenticate before using AI search", () => {
    render(<AgriculNetSearch />);

    fireEvent.click(screen.getByRole("tab", { name: "Ask AI" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Sign in for smart search")).toBeInTheDocument();
  });

  it("transcribes voice for editing and waits for explicit search submission", async () => {
    mocks.auth.user = { id: "buyer-1" };
    mocks.auth.isAuthenticated = true;
    mocks.voice.isRecording = true;
    mocks.voice.status = "recording";
    mocks.voice.stop.mockResolvedValue(
      new File(["audio"], "search.webm", { type: "audio/webm" }),
    );
    mocks.transcribe.mockResolvedValue({ transcript: "verified coffee in Bamenda" });
    mocks.ai.mockResolvedValue({
      items: [],
      count: 0,
      interpretation: "No matching listings.",
      suggestions: [],
    });

    const { rerender } = render(<AgriculNetSearch />);
    fireEvent.click(screen.getByRole("tab", { name: "Voice" }));
    fireEvent.click(screen.getByRole("button", { name: /Stop/ }));

    await waitFor(() => {
      expect(screen.getByRole("searchbox")).toHaveValue("verified coffee in Bamenda");
    });
    expect(mocks.ai).not.toHaveBeenCalled();

    mocks.voice.isRecording = false;
    mocks.voice.status = "idle";
    rerender(<AgriculNetSearch />);
    fireEvent.click(screen.getByRole("button", { name: "Search marketplace" }));
    await waitFor(() => {
      expect(mocks.ai).toHaveBeenCalledWith("verified coffee in Bamenda");
    });
  });

  it("rejects unsupported image formats before upload", () => {
    mocks.auth.user = { id: "buyer-1" };
    mocks.auth.isAuthenticated = true;
    const { container } = render(<AgriculNetSearch />);
    fireEvent.click(screen.getByRole("tab", { name: "Image" }));

    fireEvent.change(container.querySelector('input[type="file"]'), {
      target: {
        files: [new File(["not-an-image"], "crop.txt", { type: "text/plain" })],
      },
    });

    expect(screen.getByRole("alert")).toHaveTextContent("Choose a JPG, PNG, or WebP image.");
    expect(mocks.image).not.toHaveBeenCalled();
  });

  it("opens the dedicated image-search mode without invoking the AI assistant", () => {
    render(<AgriculNetSearch initialMode="image" />);

    expect(screen.getByRole("tab", { name: "Image" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("button", { name: /Take or upload a crop photo/ })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(mocks.ai).not.toHaveBeenCalled();
  });
});
