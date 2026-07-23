"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

const unwrapData = (response) => response.data?.data;
const unwrapItems = (response) => response.data?.data?.items || response.data?.data || [];

export const useShipmentByOrder = (orderId) => useQuery({
  queryKey: ["logistics", "order", orderId],
  queryFn: async () => unwrapData(await api.get(`/logistics/order/${orderId}`)),
  enabled: Boolean(orderId),
});

export const useEstimateLogistics = (params, enabled = true) => useQuery({
  queryKey: ["logistics", "estimate", params],
  queryFn: async () => unwrapData(await api.get("/logistics/rates/estimate", { params })),
  enabled: enabled && Boolean(params?.originRegion) && Boolean(params?.destinationRegion),
});

export const useAdminAssignShipment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ shipmentId, ...payload }) => unwrapData(await api.post(`/logistics/${shipmentId}/assign`, payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logistics"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useAdminUpdateShipmentPosition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ shipmentId, ...payload }) => unwrapData(await api.post(`/logistics/${shipmentId}/positions`, payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logistics"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useAdminUpdateShipmentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ shipmentId, ...payload }) => unwrapData(await api.patch(`/logistics/${shipmentId}/status`, payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logistics"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useLogistics = () => useQuery({
  queryKey: ["logistics"],
  queryFn: async () => unwrapItems(await api.get("/logistics")),
});
