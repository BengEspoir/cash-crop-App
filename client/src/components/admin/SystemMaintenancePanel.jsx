"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AlertTriangle, DatabaseBackup, RotateCcw, Wrench } from "lucide-react";
import { AdminCard, AdminStatusPill, formatAdminDate } from "@/components/admin/AdminDesignSystem";
import { Button } from "@/components/ui/button";
import { useAdminSystemOperations } from "@/hooks/useSystemOperations";

const formatBytes = (value) => {
  if (!value) return "Not available";
  if (value < 1024 * 1024) return `${Math.ceil(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

export function SystemMaintenancePanel() {
  const {
    maintenance,
    capability,
    jobs,
    setMaintenance,
    createBackup,
    restoreBackup,
  } = useAdminSystemOperations();
  const [message, setMessage] = useState("");
  const [selectedBackupId, setSelectedBackupId] = useState("");
  const [restorePhrase, setRestorePhrase] = useState("");

  useEffect(() => {
    if (maintenance.data?.message && !message) setMessage(maintenance.data.message);
  }, [maintenance.data?.message, message]);

  const operationJobs = jobs.data || [];
  const completedBackups = operationJobs.filter(
    (job) => job.operation === "backup" && job.status === "succeeded",
  );
  const activeOperation = operationJobs.some((job) => ["queued", "running"].includes(job.status));
  const isMaintenanceEnabled = Boolean(maintenance.data?.enabled);

  const toggleMaintenance = async (enabled) => {
    const prompt = enabled
      ? "Enable maintenance mode? Normal application writes will be paused."
      : "Resume normal operations and disable maintenance mode?";
    if (!window.confirm(prompt)) return;
    try {
      await setMaintenance.mutateAsync({ enabled, message });
      toast.success(enabled ? "Maintenance mode enabled." : "Normal operations resumed.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Maintenance state could not be changed.");
    }
  };

  const startBackup = async () => {
    if (!window.confirm("Create a new database backup now?")) return;
    try {
      await createBackup.mutateAsync();
      toast.success("Backup job queued. Status will update here.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Backup could not be started.");
    }
  };

  const startRestore = async () => {
    if (!selectedBackupId || restorePhrase !== "RESTORE AGRICULNET") return;
    if (!window.confirm(`Restore approved backup ${selectedBackupId}? Maintenance will remain active afterward.`)) return;
    try {
      await restoreBackup.mutateAsync({
        backupId: selectedBackupId,
        confirmation: restorePhrase,
      });
      setRestorePhrase("");
      toast.success("Restore job queued. Maintenance remains active.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Restore could not be started.");
    }
  };

  return (
    <div className="space-y-6">
      <AdminCard title="System & Maintenance">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`grid h-11 w-11 place-items-center rounded-xl ${isMaintenanceEnabled ? "bg-amber-100 text-amber-800" : "bg-green-50 text-green-800"}`}>
                <Wrench className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-bold text-ink-950">Maintenance status</p>
                <AdminStatusPill status={isMaintenanceEnabled ? "pending" : "verified"} label={isMaintenanceEnabled ? "Active" : "Normal operation"} />
              </div>
            </div>
            <label className="mt-5 block">
              <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-ink-500">User-facing message</span>
              <textarea
                className="focus-ring mt-2 min-h-28 w-full rounded-xl border border-ink-200 bg-white p-3 text-sm text-ink-900"
                value={message}
                maxLength={500}
                onChange={(event) => setMessage(event.target.value)}
              />
            </label>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                disabled={isMaintenanceEnabled || setMaintenance.isPending}
                isLoading={setMaintenance.isPending}
                onClick={() => toggleMaintenance(true)}
              >
                Enable maintenance
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={!isMaintenanceEnabled || setMaintenance.isPending}
                onClick={() => toggleMaintenance(false)}
              >
                Resume operation
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
            <AlertTriangle className="mb-3 h-5 w-5" aria-hidden="true" />
            Normal POST, PUT, PATCH, and DELETE operations are paused centrally while maintenance is active. Health, authentication, webhooks, and these admin recovery controls remain available.
          </div>
        </div>
      </AdminCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard title="Database Backups">
          <div className="space-y-5 p-6">
            <div className="flex items-start gap-3">
              <DatabaseBackup className="mt-1 h-5 w-5 text-green-800" aria-hidden="true" />
              <p className="text-sm leading-6 text-ink-600">
                {capability.data?.backup?.message || "Checking secure backup capability..."}
              </p>
            </div>
            <Button
              className="w-full sm:w-auto"
              disabled={!capability.data?.backup?.available || activeOperation || createBackup.isPending}
              isLoading={createBackup.isPending}
              onClick={startBackup}
            >
              Create database backup
            </Button>
            {!capability.data?.backup?.available ? (
              <p className="rounded-xl bg-ink-50 p-3 text-xs leading-5 text-ink-600">
                No success is simulated: configure the documented Railway database utility variables or use Supabase managed backups.
              </p>
            ) : null}
          </div>
        </AdminCard>

        <AdminCard title="Protected Restore">
          <div className="space-y-4 p-6">
            <p className="text-sm leading-6 text-ink-600">{capability.data?.restore?.message || "Checking restore capability..."}</p>
            <select
              className="focus-ring h-12 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm"
              value={selectedBackupId}
              onChange={(event) => setSelectedBackupId(event.target.value)}
            >
              <option value="">Select a completed backup</option>
              {completedBackups.map((job) => (
                <option key={job.id} value={job.id}>{job.id} · {formatAdminDate(job.finishedAt || job.createdAt)}</option>
              ))}
            </select>
            <input
              className="focus-ring h-12 w-full rounded-xl border border-ink-200 px-3 text-sm"
              value={restorePhrase}
              onChange={(event) => setRestorePhrase(event.target.value)}
              placeholder="Type RESTORE AGRICULNET"
              autoComplete="off"
            />
            <Button
              variant="danger"
              className="w-full"
              disabled={
                !capability.data?.restore?.available ||
                !isMaintenanceEnabled ||
                !selectedBackupId ||
                restorePhrase !== "RESTORE AGRICULNET" ||
                activeOperation ||
                restoreBackup.isPending
              }
              isLoading={restoreBackup.isPending}
              onClick={startRestore}
            >
              <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
              Restore selected backup
            </Button>
          </div>
        </AdminCard>
      </div>

      <AdminCard title="Database Operation History">
        <div className="divide-y divide-ink-100">
          {operationJobs.length ? operationJobs.slice(0, 10).map((job) => (
            <div key={job.id} className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold capitalize text-ink-900">{job.operation} · {job.id}</p>
                <p className="mt-1 text-xs text-ink-500">{formatAdminDate(job.finishedAt || job.startedAt || job.createdAt)}</p>
                <p className="mt-1 break-all text-xs text-ink-500">
                  Requested by {job.requestedBy || "Not available"}
                  {job.operation === "backup" ? ` | Type: ${job.backupType || "application_logical"} | Size: ${formatBytes(job.sizeBytes)}` : ""}
                </p>
                {job.errorMessage ? <p className="mt-1 text-xs text-red-700">{job.errorMessage}</p> : null}
              </div>
              <AdminStatusPill status={job.status} label={job.status} />
            </div>
          )) : (
            <p className="p-6 text-sm text-ink-500">No backup or restore jobs have been requested.</p>
          )}
        </div>
      </AdminCard>
    </div>
  );
}
