"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

const unwrapData = (response) => response.data?.data || {};

export function useDashboardPreferences() {
  return useQuery({
    queryKey: ["preferences", "dashboard"],
    queryFn: async () => unwrapData(await api.get("/preferences/dashboard")),
  });
}

export function useUpdateDashboardPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => unwrapData(await api.put("/preferences/dashboard", payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["preferences", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
