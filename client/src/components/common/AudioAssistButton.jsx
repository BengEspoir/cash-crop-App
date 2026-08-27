"use client";

import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "../../lib/utils";

export function AudioAssistButton({ text, label = "Play voice explanation", className }) {
  const [speaking, setSpeaking] = useState(false);

  const handlePlay = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.92;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      type="button"
      onClick={handlePlay}
      className={cn(
        "focus-ring inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-800 transition-colors hover:bg-green-100",
        className,
      )}
      aria-label={speaking ? "Voice explanation is playing" : label}
      title={label}
    >
      {speaking ? <VolumeX className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
    </button>
  );
}
