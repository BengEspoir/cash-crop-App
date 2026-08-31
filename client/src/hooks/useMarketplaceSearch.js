"use client";

import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";

const unwrapData = response => response.data?.data;

export function useMarketplaceSearch() {
  const aiSearch = useMutation({
    mutationFn: async query => unwrapData(await api.post("/search/ai", { query })),
  });

  const imageSearch = useMutation({
    mutationFn: async ({ file, productOverride }) => {
      const form = new FormData();
      if (file) form.append("image", file);
      if (productOverride) form.append("productOverride", productOverride);
      return unwrapData(await api.post("/search/image", form, {
        headers: { "Content-Type": "multipart/form-data" },
      }));
    },
  });

  const transcribe = useMutation({
    mutationFn: async file => {
      const form = new FormData();
      form.append("audio", file, file.name || "marketplace-search.webm");
      return unwrapData(await api.post("/search/transcribe", form, {
        headers: { "Content-Type": "multipart/form-data" },
      }));
    },
  });

  return { aiSearch, imageSearch, transcribe };
}
