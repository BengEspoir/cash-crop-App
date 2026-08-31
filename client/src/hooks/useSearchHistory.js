"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const MAX_HISTORY = 8;

export function useSearchHistory(userId) {
  const storageKey = useMemo(
    () => userId ? `agriculnet-search-history:${userId}` : null,
    [userId],
  );
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!storageKey) {
      setHistory([]);
      return;
    }
    try {
      const stored = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
      setHistory(Array.isArray(stored) ? stored.slice(0, MAX_HISTORY) : []);
    } catch {
      setHistory([]);
    }
  }, [storageKey]);

  const remember = useCallback((query, mode) => {
    if (!storageKey || !String(query || "").trim()) return;
    setHistory(current => {
      const item = { query: String(query).trim(), mode, createdAt: Date.now() };
      const next = [
        item,
        ...current.filter(entry => entry.query.toLowerCase() !== item.query.toLowerCase()),
      ].slice(0, MAX_HISTORY);
      window.localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, [storageKey]);

  const clear = useCallback(() => {
    if (storageKey) window.localStorage.removeItem(storageKey);
    setHistory([]);
  }, [storageKey]);

  return { history, remember, clear };
}
