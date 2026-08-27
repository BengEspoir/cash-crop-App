import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AudioAssistButton } from "./AudioAssistButton";

describe("AudioAssistButton", () => {
  const speak = vi.fn();
  const cancel = vi.fn();

  beforeEach(() => {
    speak.mockClear();
    cancel.mockClear();
    window.speechSynthesis = { speak, cancel };
    window.SpeechSynthesisUtterance = class SpeechSynthesisUtterance {
      constructor(text) {
        this.text = text;
      }
    };
    globalThis.SpeechSynthesisUtterance = window.SpeechSynthesisUtterance;
  });

  it("plays the supplied technical explanation", async () => {
    render(<AudioAssistButton text="Moisture content affects storage." label="Explain moisture" />);
    await userEvent.click(screen.getByRole("button", { name: "Explain moisture" }));
    expect(cancel).toHaveBeenCalledOnce();
    expect(speak).toHaveBeenCalledWith(expect.objectContaining({ text: "Moisture content affects storage." }));
  });
});
