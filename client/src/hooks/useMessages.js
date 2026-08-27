"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { supabase } from "@/lib/supabaseClient";

const unwrapItems = (response) => response.data?.data?.items || response.data?.data || [];
const unwrapData = (response) => response.data?.data;

export const useConversations = () => useQuery({
  queryKey: ["conversations"],
  queryFn: async () => unwrapItems(await api.get("/conversations")),
});

export const useConversation = (id) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!id) return undefined;
    const channel = supabase
      .channel(`messages:${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["conversation", id] });
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, queryClient]);

  return useQuery({
    queryKey: ["conversation", id],
    enabled: Boolean(id),
    queryFn: async () => unwrapData(await api.get(`/conversations/${id}`)),
  });
};

export const useStartConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => unwrapData(await api.post("/conversations", payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, content }) => unwrapData(await api.post(`/conversations/${conversationId}/messages`, { content })),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["conversation", variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};
