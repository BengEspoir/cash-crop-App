"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const STORAGE_KEY = "agriculnet_site_prefs_v1";

export const useSitePrefsStore = create(
  persist(
    (set) => ({
      /** ISO 3166-1 alpha-2, default Cameroon */
      countryCode: "CM",
      setCountryCode: (code) => set({ countryCode: code || "CM" }),
    }),
    { name: STORAGE_KEY },
  ),
);
