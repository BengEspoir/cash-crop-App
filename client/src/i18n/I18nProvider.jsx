"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { dictionaries, getByPath, interpolate } from "./dictionaries";
import { translatePhrase } from "./phraseTranslations";

const STORAGE_KEY = "agriculnet_locale_v1";
const SUPPORTED_LOCALES = ["en", "fr", "es"];
const originalText = new WeakMap();
const originalAttributes = new WeakMap();

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

  useEffect(() => {
    if (!ready || typeof document === "undefined") return undefined;
    const attributes = ["placeholder", "aria-label", "title"];
    const skipTags = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "CODE", "PRE"]);

    const translateTextNode = (node) => {
      const parent = node.parentElement;
      if (!parent || skipTags.has(parent.tagName) || parent.closest("[data-i18n-skip='true']")) return;
      const current = node.nodeValue || "";
      const trimmed = current.trim();
      if (!trimmed) return;
      if (!originalText.has(node)) {
        if (locale !== "en" && translatePhrase(trimmed, locale) === trimmed) return;
        originalText.set(node, trimmed);
      }
      const source = originalText.get(node);
      const translated = translatePhrase(source, locale);
      if (translated === source && locale !== "en") return;
      node.nodeValue = current.replace(trimmed, locale === "en" ? source : translated);
    };

    const translateElementAttributes = (element) => {
      if (skipTags.has(element.tagName) || element.closest("[data-i18n-skip='true']")) return;
      for (const attribute of attributes) {
        if (!element.hasAttribute(attribute)) continue;
        let map = originalAttributes.get(element);
        if (!map) {
          map = {};
          originalAttributes.set(element, map);
        }
        if (!map[attribute]) {
          const current = element.getAttribute(attribute);
          if (locale !== "en" && translatePhrase(current, locale) === current) continue;
          map[attribute] = current;
        }
        const source = map[attribute];
        element.setAttribute(attribute, locale === "en" ? source : translatePhrase(source, locale));
      }
    };

    const translateTree = (root = document.body) => {
      if (!root) return;
      if (root.nodeType === Node.ELEMENT_NODE) translateElementAttributes(root);
      const elementWalker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
      while (elementWalker.nextNode()) translateElementAttributes(elementWalker.currentNode);
      const textWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      while (textWalker.nextNode()) translateTextNode(textWalker.currentNode);
    };

    translateTree();
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          translateTextNode(mutation.target);
        }
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
          if (node.nodeType === Node.ELEMENT_NODE) translateTree(node);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
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
