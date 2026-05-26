"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

const unwrapItems = (response) => response.data?.data?.items || response.data?.data || [];
const unwrapData = (response) => response.data?.data;

export const usePayments = () => useQuery({
  queryKey: ["payments"],
  queryFn: async () => unwrapItems(await api.get("/payments")),
});

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => unwrapData(await api.post("/payments", payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const useCreateCheckoutIntent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => unwrapData(await api.post("/payments/checkout-intents", payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const useConfirmCheckoutIntent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => unwrapData(await api.post(`/payments/checkout-intents/${id}/confirm`)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const useReleasePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => unwrapData(await api.post(`/payments/${id}/release`)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const useRequestWithdrawal = () => useMutation({
  mutationFn: async () => unwrapData(await api.post("/payments/withdrawals")),
});
