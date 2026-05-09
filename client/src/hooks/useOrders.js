"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

const unwrapItems = (response) => response.data?.data?.items || response.data?.data || [];
const unwrapData = (response) => response.data?.data;

export const useOrders = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => unwrapItems(await api.get("/orders")),
  });

  return {
    orders: data || [],
    isLoading,
    error,
    refetch,
  };
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => unwrapData(await api.post("/orders", payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};
