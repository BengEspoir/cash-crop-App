"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

const unwrapItems = (response) => response.data?.data?.items || response.data?.data || [];
const unwrapData = (response) => response.data?.data;

export const useQuotes = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["quotes"],
    queryFn: async () => unwrapItems(await api.get("/quotes")),
  });

  return {
    quotes: data || [],
    isLoading,
    error,
    refetch,
  };
};

export const useCreateQuote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => unwrapData(await api.post("/quotes", payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const useQuoteAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action, reason }) => unwrapData(await api.post(`/quotes/${id}/${action}`, { reason })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};
