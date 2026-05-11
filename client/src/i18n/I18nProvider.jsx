"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { dictionaries, getByPath, interpolate } from "./dictionaries";

const STORAGE_KEY = "agriculnet_locale_v1";

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
      if (stored === "fr" || stored === "en") {
        setLocaleState(stored);
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = locale === "fr" ? "fr" : "en";
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
  }, [locale, ready]);

  const setLocale = useCallback((next) => {
    if (next === "fr" || next === "en") {
      setLocaleState(next);
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
