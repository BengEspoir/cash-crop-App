"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

const unwrapItems = (response) => response.data?.data?.items || response.data?.data || [];
const unwrapData = (response) => response.data?.data;

export const useListings = (filters = {}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["listings", filters],
    queryFn: async () => unwrapItems(await api.get("/listings", { params: filters })),
  });

  return {
    listings: data || [],
    isLoading,
    error,
    refetch,
  };
};

export const useListing = (id) => useQuery({
  queryKey: ["listing", id],
  enabled: Boolean(id),
  queryFn: async () => unwrapData(await api.get(`/listings/${id}`)),
});

export const useCreateListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => unwrapData(await api.post("/listings", payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "farmer"] });
    },
  });
};

export const useUpdateListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => unwrapData(await api.patch(`/listings/${id}`, payload)),
    onSuccess: (listing) => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["listing", listing?.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "farmer"] });
    },
  });
};

export const useDeleteListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => unwrapData(await api.delete(`/listings/${id}`)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "farmer"] });
    },
  });
};
