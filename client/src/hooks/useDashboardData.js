"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export function useDashboardFilters(resource, defaults = {}) {
  const urlDefaults = typeof window === "undefined"
    ? {}
    : Object.fromEntries(["q", "status", "role", "region", "country", "crop", "grade", "priority", "dateFrom", "dateTo", "sort"]
      .map((key) => [key, new URLSearchParams(window.location.search).get(key)])
      .filter(([, value]) => value));
  const baseFilters = {
    resource,
    q: "",
    status: "all",
    role: "all",
    region: "all",
    country: "all",
    crop: "all",
    grade: "all",
    priority: "all",
    dateFrom: "",
    dateTo: "",
    sort: "newest",
    ...urlDefaults,
    ...defaults,
  };
  const [filters, setFilters] = useState({
    ...baseFilters,
  });

  const queryFilters = useMemo(() => filters, [filters]);
  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const resetFilters = () => setFilters({ ...baseFilters });

  return {
    filters,
    queryFilters,
    updateFilter,
    resetFilters,
  };
}

const fetchDashboard = async (role, filters = {}) => {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
  const { data } = await api.get(`/dashboard/${role}`, { params });
  return data.data;
};

export function useDashboardData(role, filters = {}) {
  return useQuery({
    queryKey: ["dashboard", role, filters],
    queryFn: () => fetchDashboard(role, filters),
    enabled: Boolean(role),
  });
}

export async function exportDashboardCsv(role, filters = {}) {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
  const response = await api.get(`/dashboard/${role}/export`, {
    params,
    responseType: "blob",
  });
  const disposition = response.headers?.["content-disposition"] || "";
  const filename = disposition.match(/filename="?([^";]+)"?/)?.[1] || `${role}-dashboard-export.csv`;
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
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
