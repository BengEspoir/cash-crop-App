"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useOrders = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      try {
        const response = await api.get("/orders");
        return response.data.data;
      } catch (err) {
        console.warn("Orders API not fully implemented, returning empty");
        return [];
      }
    },
  });

  return {
    orders: data || [],
    isLoading,
    error,
    refetch,
  };
};
