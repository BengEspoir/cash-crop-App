"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

const data = (response) => response.data?.data;

export function useAdminSystemOperations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "system-operations"] });
    queryClient.invalidateQueries({ queryKey: ["system", "status"] });
  };

  const maintenance = useQuery({
    queryKey: ["admin", "system-operations", "maintenance"],
    queryFn: async () => data(await api.get("/admin/maintenance")),
    refetchInterval: 15000,
  });
  const capability = useQuery({
    queryKey: ["admin", "system-operations", "capability"],
    queryFn: async () => data(await api.get("/admin/backups/capability")),
  });
  const jobs = useQuery({
    queryKey: ["admin", "system-operations", "jobs"],
    queryFn: async () => data(await api.get("/admin/backups")),
    refetchInterval: (query) => query.state.data?.some((job) => ["queued", "running"].includes(job.status)) ? 3000 : 15000,
  });

  const setMaintenance = useMutation({
    mutationFn: async ({ enabled, message }) => data(await api.post(
      `/admin/maintenance/${enabled ? "enable" : "disable"}`,
      { message },
    )),
    onSuccess: invalidate,
  });
  const createBackup = useMutation({
    mutationFn: async () => data(await api.post("/admin/backups")),
    onSuccess: invalidate,
  });
  const restoreBackup = useMutation({
    mutationFn: async ({ backupId, confirmation }) => data(await api.post("/admin/restores", { backupId, confirmation })),
    onSuccess: invalidate,
  });

  return {
    maintenance,
    capability,
    jobs,
    setMaintenance,
    createBackup,
    restoreBackup,
  };
}
