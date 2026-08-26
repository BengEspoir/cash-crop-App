"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { supabase } from "@/lib/supabaseClient";
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
    mutationFn: async (payload) => {
      if (payload.newPassword !== payload.confirmPassword) throw new Error("Passwords do not match.");
      const { data: current, error: userError } = await supabase.auth.getUser();
      if (userError || !current.user?.email) throw userError || new Error("No authenticated email is available.");
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: current.user.email,
        password: payload.currentPassword,
      });
      if (verifyError) throw verifyError;
      const { error } = await supabase.auth.updateUser({ password: payload.newPassword });
      if (error) throw error;
      await supabase.auth.signOut({ scope: "others" });
      return { updated: true };
    },
  });
}

export function useRequestContactChange() {
  return useMutation({
    mutationFn: async (payload) => {
      if (payload.type === "email") {
        const { error } = await supabase.auth.updateUser(
          { email: payload.value },
          { emailRedirectTo: `${window.location.origin}/oauth/callback?flow=email-change` },
        );
        if (error) throw error;
        return { type: "email", pending: true };
      }
      return unwrapData(await api.post("/auth/contact-change/request", payload));
    },
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
