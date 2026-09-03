"use client";

import { useEffect, useId, useRef, useState } from "react";

const SCRIPT_ID = "cloudflare-turnstile-script";

const loadTurnstile = () => new Promise((resolve, reject) => {
  if (window.turnstile) {
    resolve(window.turnstile);
    return;
  }
  let script = document.getElementById(SCRIPT_ID);
  if (!script) {
    script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
  script.addEventListener("load", () => resolve(window.turnstile), { once: true });
  script.addEventListener("error", reject, { once: true });
});

export function TurnstileWidget({ action, onTokenChange, resetKey = 0 }) {
  const containerRef = useRef(null);
  const widgetRef = useRef(null);
  const onTokenChangeRef = useRef(onTokenChange);
  const reactId = useId();
  const [error, setError] = useState("");
  const enabled = process.env.NEXT_PUBLIC_TURNSTILE_ENABLED === "true";
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    if (!enabled) {
      onTokenChangeRef.current("");
      return undefined;
    }
    if (!siteKey) {
      setError("Bot protection is enabled but not configured. Please contact support.");
      onTokenChangeRef.current("");
      return undefined;
    }

    let cancelled = false;
    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !containerRef.current || !turnstile) return;
        if (widgetRef.current !== null) turnstile.remove(widgetRef.current);
        widgetRef.current = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action,
          theme: "light",
          size: "flexible",
          callback: (token) => {
            setError("");
            onTokenChangeRef.current(token);
          },
          "expired-callback": () => onTokenChangeRef.current(""),
          "error-callback": () => {
            setError("Bot protection could not load. Check your connection and try again.");
            onTokenChangeRef.current("");
          },
        });
      })
      .catch(() => {
        setError("Bot protection could not load. Check your connection and try again.");
        onTokenChangeRef.current("");
      });
    return () => {
      cancelled = true;
      if (window.turnstile && widgetRef.current !== null) {
        window.turnstile.remove(widgetRef.current);
        widgetRef.current = null;
      }
    };
  }, [action, enabled, reactId, resetKey, siteKey]);

  if (!enabled) return null;

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="min-h-[65px] w-full overflow-hidden" />
      <p aria-live="polite" className="text-xs text-red-700">{error}</p>
    </div>
  );
}
