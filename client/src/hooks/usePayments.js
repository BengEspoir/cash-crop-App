"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { queryKeys } from "@/lib/queryKeys";
import { useQueryUserId } from "@/hooks/useQueryUser";

const unwrapItems = (response) => response.data?.data?.items || response.data?.data || [];
const unwrapData = (response) => response.data?.data;

export const usePayments = () => {
  const userId = useQueryUserId();
  return useQuery({
    queryKey: queryKeys.payments.list(userId),
    queryFn: async () => unwrapItems(await api.get("/payments")),
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  const userId = useQueryUserId();
  return useMutation({
    mutationFn: async (payload) => unwrapData(await api.post("/payments", payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.list(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
};

export const useCreateCheckoutIntent = () => {
  const queryClient = useQueryClient();
  const userId = useQueryUserId();
  return useMutation({
    mutationFn: async (payload) => unwrapData(await api.post("/payments/checkout-intents", payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.list(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
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
    mutationFn: async ({ id, reason }) => unwrapData(await api.post(`/payments/${id}/release`, {
      confirmation: "RELEASE PROTECTED PAYOUT",
      reason,
    })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const useRequestWithdrawal = () => {
  const queryClient = useQueryClient();
  const userId = useQueryUserId();
  return useMutation({
    mutationFn: async () => unwrapData(await api.post("/payments/withdrawals")),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.list(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
};
