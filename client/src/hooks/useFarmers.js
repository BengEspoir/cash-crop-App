"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

const unwrapData = (response) => response.data?.data;

export const useFarmers = (filters = {}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["farmers", filters],
    queryFn: async () => unwrapData(await api.get("/farmers", { params: filters })),
  });

  return {
    farmers: data?.items || (Array.isArray(data) ? data : []),
    count: data?.count || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 1,
    isLoading,
    error,
    refetch,
  };
};

export const useFarmer = (id) => useQuery({
  queryKey: ["farmer", id],
  enabled: Boolean(id),
  queryFn: async () => unwrapData(await api.get(`/farmers/${id}`)),
});
