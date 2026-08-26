import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AgriculNetAIAssistant } from "./AgriculNetAIAssistant";

const { apiPostMock } = vi.hoisted(() => ({
  apiPostMock: vi.fn(),
}));

vi.mock("@/lib/axios", () => ({
  default: {
    post: apiPostMock,
  },
}));

vi.mock("@/hooks/usePrefersReducedMotion", () => ({
  usePrefersReducedMotion: () => true,
}));

vi.mock("@/i18n/I18nProvider", () => ({
  useI18n: () => ({
    t: (key) => ({
      "assistant.title": "AgriculNet AI",
      "assistant.subtitle": "Marketplace guidance",
      "assistant.reset": "Reset conversation",
      "assistant.close": "Close assistant",
      "assistant.greeting": "Hello! How can I help?",
      "assistant.you": "You",
      "assistant.typing": "AgriculNet AI is typing",
      "assistant.inputLabel": "Message AgriculNet AI",
      "assistant.inputPlaceholder": "Ask about AgriculNet",
      "assistant.send": "Send message",
      "assistant.privacy": "Do not share sensitive information.",
      "assistant.open": "Open AgriculNet AI",
      "assistant.errorGeneric": "Something went wrong.",
      "assistant.errorTimeout": "The request timed out.",
      "assistant.errorNotConfigured": "The assistant is not configured.",
      "assistant.errorRateLimit": "Too many requests. Try again later.",
      "assistant.errorOffline": "You appear to be offline.",
      "assistant.errorUnavailable": "The assistant is temporarily unavailable.",
    })[key] || key,
  }),
}));

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
}

async function openAssistant(user) {
  await user.click(screen.getByRole("button", { name: "Open AgriculNet AI" }));
  return screen.getByRole("dialog", { name: "AgriculNet AI" });
}

beforeEach(() => {
  apiPostMock.mockReset();
  Element.prototype.scrollIntoView = vi.fn();
  window.requestAnimationFrame = vi.fn((callback) => {
    callback(0);
    return 1;
  });
  window.cancelAnimationFrame = vi.fn();
});

describe("AgriculNetAIAssistant", () => {
  test("sends a trimmed user message and exposes loading until the reply arrives", async () => {
    const request = deferred();
    apiPostMock.mockReturnValue(request.promise);
    const user = userEvent.setup();
    render(<AgriculNetAIAssistant />);

    const dialog = await openAssistant(user);
    const input = screen.getByRole("textbox", { name: "Message AgriculNet AI" });
    await user.type(input, "  How do I sell cocoa?  ");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(screen.getByText("How do I sell cocoa?")).toBeInTheDocument();
    expect(dialog.querySelector('[role="log"]')).toHaveAttribute("aria-busy", "true");
    expect(screen.getByLabelText("AgriculNet AI is typing")).toBeInTheDocument();
    expect(input).toBeDisabled();
    expect(input).toHaveValue("");
    expect(apiPostMock).toHaveBeenCalledWith(
      "/chat",
      { messages: [{ role: "user", content: "How do I sell cocoa?" }] },
      expect.objectContaining({ timeout: 50000, signal: expect.any(AbortSignal) }),
    );

    request.resolve({ data: { data: { reply: "Start with a verified crop listing." } } });

    expect(await screen.findByText("Start with a verified crop listing.")).toBeInTheDocument();
    await waitFor(() => expect(input).toBeEnabled());
    expect(dialog.querySelector('[role="log"]')).toHaveAttribute("aria-busy", "false");
    expect(screen.queryByLabelText("AgriculNet AI is typing")).not.toBeInTheDocument();
  }, 10000);

  test("announces a translated API error and allows another message", async () => {
    apiPostMock.mockRejectedValue({
      response: {
        status: 429,
        data: { error: { code: "AI_RATE_LIMITED" } },
      },
    });
    const user = userEvent.setup();
    render(<AgriculNetAIAssistant />);

    await openAssistant(user);
    const input = screen.getByRole("textbox", { name: "Message AgriculNet AI" });
    await user.type(input, "Show me cocoa listings");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Too many requests. Try again later.");
    expect(screen.getByText("Show me cocoa listings")).toBeInTheDocument();
    await waitFor(() => expect(input).toBeEnabled());
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
  });

  test("resets messages, errors, and the draft back to the welcome state", async () => {
    apiPostMock.mockResolvedValue({ data: { data: { reply: "Use the farmer dashboard." } } });
    const user = userEvent.setup();
    render(<AgriculNetAIAssistant />);

    await openAssistant(user);
    const input = screen.getByRole("textbox", { name: "Message AgriculNet AI" });
    await user.type(input, "Where should I begin?");
    await user.click(screen.getByRole("button", { name: "Send message" }));
    expect(await screen.findByText("Use the farmer dashboard.")).toBeInTheDocument();

    await user.type(input, "A draft I do not want");
    await user.click(screen.getByRole("button", { name: "Reset conversation" }));

    expect(screen.getByText("Hello! How can I help?")).toBeInTheDocument();
    expect(screen.queryByText("Where should I begin?")).not.toBeInTheDocument();
    expect(screen.queryByText("Use the farmer dashboard.")).not.toBeInTheDocument();
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
  });
});
