"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

const fetchDashboard = async (role) => {
  const { data } = await api.get(`/dashboard/${role}`);
  return data.data;
};

export function useDashboardData(role) {
  return useQuery({
    queryKey: ["dashboard", role],
    queryFn: () => fetchDashboard(role),
    enabled: Boolean(role),
  });
}

export function useAdminPendingUsers() {
  return useQuery({
    queryKey: ["admin", "pending-users"],
    queryFn: async () => {
      const { data } = await api.get("/admin/pending-users");
      return data.data || [];
    },
  });
}

export function useAdminReviewUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, action, reason }) => {
      const { data } = await api.post("/admin/review-user", { userId, action, reason });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "admin"] });
    },
  });
}
