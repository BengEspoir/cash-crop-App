"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { dictionaries, getByPath, interpolate } from "./dictionaries";

const STORAGE_KEY = "agriculnet_locale_v1";
const SUPPORTED_LOCALES = ["en", "fr"];

function normalizeLocale(value) {
  const code = String(value || "").toLowerCase().split("-")[0];
  return SUPPORTED_LOCALES.includes(code) ? code : null;
}

function detectBrowserLocale() {
  if (typeof navigator === "undefined") return "en";
  const languages = Array.isArray(navigator.languages) && navigator.languages.length
    ? navigator.languages
    : [navigator.language];
  for (const language of languages) {
    const normalized = normalizeLocale(language);
    if (normalized) return normalized;
  }
  return "en";
}

const I18nContext = createContext({
  locale: "en",
  setLocale: () => {},
  t: (_key, _vars) => "",
});

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const storedLocale = normalizeLocale(stored);
      if (storedLocale) {
        setLocaleState(storedLocale);
      } else {
        setLocaleState(detectBrowserLocale());
      }
    } catch {
      setLocaleState(detectBrowserLocale());
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = normalizeLocale(locale) || "en";
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
  }, [locale, ready]);

  const setLocale = useCallback((next) => {
    const normalized = normalizeLocale(next);
    if (normalized) {
      setLocaleState(normalized);
    }
  }, []);

  const t = useCallback(
    (key, vars) => {
      const table = dictionaries[locale] || dictionaries.en;
      const fallback = dictionaries.en;
      let raw = getByPath(table, key);
      if (raw === undefined) {
        raw = getByPath(fallback, key);
      }
      if (typeof raw !== "string") {
        return typeof raw === "number" ? String(raw) : key;
      }
      return interpolate(raw, vars);
    },
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
