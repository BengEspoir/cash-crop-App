"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import useAuth from "@/hooks/useAuth";

const unwrapData = (response) => response.data?.data || {};

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { fetchMe } = useAuth();

  return useMutation({
    mutationFn: async (payload) => unwrapData(await api.patch("/auth/me", payload)),
    onSuccess: async () => {
      await fetchMe();
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload) => unwrapData(await api.post("/auth/me/change-password", payload)),
  });
}

export function useRequestContactChange() {
  return useMutation({
    mutationFn: async (payload) => unwrapData(await api.post("/auth/contact-change/request", payload)),
  });
}

export function useConfirmContactChange() {
  const queryClient = useQueryClient();
  const { fetchMe } = useAuth();

  return useMutation({
    mutationFn: async (payload) => unwrapData(await api.post("/auth/contact-change/confirm", payload)),
    onSuccess: async () => {
      await fetchMe();
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useRecoveryContacts() {
  return useQuery({
    queryKey: ["auth", "recovery-contacts"],
    queryFn: async () => unwrapData(await api.get("/auth/recovery-contacts")),
  });
}

export function useAddRecoveryContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => unwrapData(await api.post("/auth/recovery-contacts", payload)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["auth", "recovery-contacts"] }),
  });
}

export function useDeleteRecoveryContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => unwrapData(await api.delete(`/auth/recovery-contacts/${id}`)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["auth", "recovery-contacts"] }),
  });
}
