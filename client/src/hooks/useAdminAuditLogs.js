"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export function useAdminAuditLogs(limit = 100) {
  return useQuery({
    queryKey: ["admin", "audit-logs", limit],
    queryFn: async () => {
      const { data } = await api.get("/admin/audit-logs", { params: { limit } });
      return data.data || { items: [], count: 0 };
    },
  });
}
