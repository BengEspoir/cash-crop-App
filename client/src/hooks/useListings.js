"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useListings = (filters = {}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["listings", filters],
    queryFn: async () => {
      // In a real app, this would fetch from /listings
      // For now, we return empty or fetch if endpoint exists
      try {
        const response = await api.get("/listings", { params: filters });
        return response.data.data;
      } catch (err) {
        console.warn("Listings API not fully implemented, returning empty");
        return [];
      }
    },
  });

  return {
    listings: data || [],
    isLoading,
    error,
    refetch,
  };
};
