"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "../../lib/utils";

const typeConfig = {
  success: {
    icon: CheckCircle2,
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-800",
    iconColor: "text-green-500",
    progress: "bg-green-500",
  },
  error: {
    icon: AlertCircle,
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    iconColor: "text-red-500",
    progress: "bg-red-500",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    iconColor: "text-amber-500",
    progress: "bg-amber-500",
  },
  info: {
    icon: Info,
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    iconColor: "text-blue-500",
    progress: "bg-blue-500",
  },
};

/**
 * Individual toast item with auto-dismiss and progress bar
 */
export function ToastItem({
  id,
  message,
  type = "info",
  duration = 4000,
  onDismiss,
}) {
  const [progress, setProgress] = useState(100);
  const config = typeConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss?.(id);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [id, duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative w-full max-w-sm overflow-hidden rounded-xl border shadow-lift",
        config.bg,
        config.border,
      )}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", config.iconColor)} />
        <p className={cn("flex-1 text-[13px] font-medium leading-5", config.text)}>{message}</p>
        <button
          onClick={() => onDismiss?.(id)}
          className={cn("shrink-0 rounded-md p-0.5 transition-colors hover:bg-black/5", config.text)}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="h-[3px] w-full bg-black/5">
        <motion.div
          className={cn("h-full", config.progress)}
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
}

/**
 * Toast container — position fixed, stacks toasts vertically
 */
export function ToastContainer({ toasts = [], onDismiss }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[100] flex flex-col items-end justify-end gap-2 p-4 sm:justify-start sm:p-6">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem {...toast} onDismiss={onDismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
