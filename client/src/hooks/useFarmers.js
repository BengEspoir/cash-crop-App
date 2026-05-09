"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

const unwrapItems = (response) => response.data?.data?.items || response.data?.data || [];
const unwrapData = (response) => response.data?.data;

export const useFarmers = (filters = {}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["farmers", filters],
    queryFn: async () => unwrapItems(await api.get("/farmers", { params: filters })),
  });

  return {
    farmers: data || [],
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
