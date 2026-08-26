"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { queryKeys } from "@/lib/queryKeys";
import { useQueryUserId } from "@/hooks/useQueryUser";

const unwrapItems = (response) => response.data?.data?.items || response.data?.data || [];
const unwrapData = (response) => response.data?.data;

export const useListings = (filters = {}) => {
  const userId = useQueryUserId();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.listings.list(userId, filters),
    queryFn: async () => unwrapItems(await api.get("/listings", { params: filters })),
  });

  return {
    listings: data || [],
    isLoading,
    error,
    refetch,
  };
};

export const useListing = (id) => {
  const userId = useQueryUserId();
  return useQuery({
    queryKey: queryKeys.listings.detail(userId, id),
    enabled: Boolean(id),
    queryFn: async () => unwrapData(await api.get(`/listings/${id}`)),
  });
};

export const useCreateListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => unwrapData(await api.post("/listings", payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.details });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.role("farmer") });
    },
  });
};

export const useUpdateListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => unwrapData(await api.patch(`/listings/${id}`, payload)),
    onSuccess: (listing) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.details });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.role("farmer") });
    },
  });
};

export const useDeleteListing = () => {
  const queryClient = useQueryClient();
  const userId = useQueryUserId();
  return useMutation({
    mutationFn: async (id) => unwrapData(await api.delete(`/listings/${id}`)),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.all });
      queryClient.removeQueries({
        predicate: (query) => query.queryKey.join("|") === queryKeys.listings.detail(userId, id).join("|"),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.role("farmer") });
    },
  });
};
