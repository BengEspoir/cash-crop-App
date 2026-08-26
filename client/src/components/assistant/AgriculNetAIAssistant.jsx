"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, RotateCcw, Send, ShieldCheck, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";
import { useAgriculNetAIChat } from "@/hooks/useAgriculNetAIChat";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function AgriculNetAIAssistant() {
  const { t } = useI18n();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const {
    draft,
    errorKey,
    isLoading,
    maxMessageLength,
    messages,
    resetConversation: resetChat,
    setDraft,
    submitMessage,
  } = useAgriculNetAIChat();
  const launcherRef = useRef(null);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        window.requestAnimationFrame(() => launcherRef.current?.focus());
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "end",
    });
  }, [isLoading, isOpen, messages, prefersReducedMotion]);

  function closeAssistant() {
    setIsOpen(false);
    window.requestAnimationFrame(() => launcherRef.current?.focus());
  }

  function resetConversation() {
    resetChat();
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await submitMessage(draft);
  }

  function handleInputKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <>
      {isOpen && (
        <section
          id="agriculnet-ai-dialog"
          role="dialog"
          aria-labelledby="agriculnet-ai-title"
          aria-describedby="agriculnet-ai-description"
          className={cn(
            "fixed inset-x-3 bottom-36 z-[70] flex h-[min(38rem,calc(100dvh-10rem))] flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-[0_24px_70px_rgba(11,18,32,0.24)]",
            "animate-fade-rise motion-reduce:animate-none sm:inset-x-auto sm:bottom-24 sm:right-6 sm:h-[min(38rem,calc(100dvh-7rem))] sm:w-[24rem]",
          )}
        >
          <header className="flex shrink-0 items-center gap-3 bg-green-900 px-4 py-3.5 text-white">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
              <Sparkles className="h-5 w-5 text-gold-300" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="agriculnet-ai-title" className="truncate text-[15px] font-bold">
                {t("assistant.title")}
              </h2>
              <p id="agriculnet-ai-description" className="truncate text-xs text-green-200">
                {t("assistant.subtitle")}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 shrink-0 px-0 text-green-100 hover:bg-white/10 hover:text-white motion-reduce:transition-none"
              onClick={resetConversation}
              aria-label={t("assistant.reset")}
              title={t("assistant.reset")}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 shrink-0 px-0 text-green-100 hover:bg-white/10 hover:text-white motion-reduce:transition-none"
              onClick={closeAssistant}
              aria-label={t("assistant.close")}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </header>

          <div
            className="flex-1 space-y-4 overflow-y-auto bg-ink-50 px-4 py-4"
            role="log"
            aria-live="polite"
            aria-relevant="additions text"
            aria-busy={isLoading}
          >
            {messages.map((message) => {
              const isUser = message.role === "user";
              const content = message.kind === "welcome" ? t("assistant.greeting") : message.content;

              return (
                <div
                  key={message.id}
                  className={cn("flex", isUser ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[86%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-soft",
                      isUser
                        ? "rounded-br-md bg-green-800 text-white"
                        : "rounded-bl-md border border-ink-200 bg-white text-ink-800",
                    )}
                  >
                    <span className="sr-only">
                      {isUser ? t("assistant.you") : t("assistant.title")}: {" "}
                    </span>
                    <p className="whitespace-pre-wrap break-words">{content}</p>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start" aria-label={t("assistant.typing")}>
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-ink-200 bg-white px-4 py-3 shadow-soft">
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-green-700 motion-reduce:animate-none"
                      style={{ animationDelay: `${dot * 120}ms` }}
                      aria-hidden="true"
                    />
                  ))}
                  <span className="sr-only">{t("assistant.typing")}</span>
                </div>
              </div>
            )}

            {errorKey && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs leading-relaxed text-red-800"
              >
                {t(errorKey)}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="shrink-0 border-t border-ink-200 bg-white p-3" onSubmit={handleSubmit}>
            <div className="flex items-end gap-2">
              <Textarea
                ref={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleInputKeyDown}
                maxLength={maxMessageLength}
                rows={2}
                disabled={isLoading}
                aria-label={t("assistant.inputLabel")}
                placeholder={t("assistant.inputPlaceholder")}
                className="max-h-28 min-h-[44px] resize-none py-2.5 motion-reduce:transition-none"
              />
              <Button
                type="submit"
                size="md"
                disabled={!draft.trim() || isLoading}
                aria-label={t("assistant.send")}
                className="h-11 w-11 shrink-0 px-0 motion-reduce:transition-none"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            <div className="mt-2 flex items-start gap-1.5 text-[10px] leading-relaxed text-ink-500">
              <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-green-700" aria-hidden="true" />
              <p>{t("assistant.privacy")}</p>
            </div>
          </form>
        </section>
      )}

      <button
        ref={launcherRef}
        type="button"
        className={cn(
          "fixed bottom-20 right-5 z-[71] flex h-14 w-14 items-center justify-center rounded-full bg-green-800 text-white shadow-[0_12px_32px_rgba(26,107,60,0.35)]",
          "transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-glow focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-800/25 focus-visible:ring-offset-2 active:scale-95",
          "motion-reduce:transform-none motion-reduce:transition-none sm:bottom-6 sm:right-6",
        )}
        onClick={() => (isOpen ? closeAssistant() : setIsOpen(true))}
        aria-label={isOpen ? t("assistant.close") : t("assistant.open")}
        aria-expanded={isOpen}
        aria-controls="agriculnet-ai-dialog"
      >
        {isOpen ? (
          <X className="h-6 w-6" aria-hidden="true" />
        ) : (
          <MessageCircle className="h-6 w-6" aria-hidden="true" />
        )}
        {!isOpen && (
          <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-gold-400" aria-hidden="true" />
        )}
      </button>
    </>
  );
}
