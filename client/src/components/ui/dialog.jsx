"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

export const DialogOverlay = React.forwardRef(function DialogOverlay({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 bg-ink-900/45 backdrop-blur-[2px] transition-opacity motion-safe:animate-in motion-safe:fade-in duration-enter ease-enterprise",
        className,
      )}
      {...props}
    />
  );
});

export const DialogContent = React.forwardRef(function DialogContent(
  { className, children, showClose = true, ...props },
  ref,
) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[720px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[18px] border border-ink-200 bg-white p-4 shadow-lift outline-none motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 duration-move ease-enterprise sm:p-6",
          className,
        )}
        {...props}
      >
        {children}
        {showClose ? (
          <DialogClose
            className="focus-ring absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-[10px] text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800 sm:right-4 sm:top-4"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </DialogClose>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});

export function DialogHeader({ className, ...props }) {
  return <div className={cn("space-y-1.5", className)} {...props} />;
}

export function DialogFooter({ className, ...props }) {
  return <div className={cn("mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />;
}

export const DialogTitle = React.forwardRef(function DialogTitle({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn("font-display text-[20px] leading-[1.2] text-ink-900", className)}
      {...props}
    />
  );
});

export const DialogDescription = React.forwardRef(function DialogDescription({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn("text-[13px] leading-6 text-ink-600", className)}
      {...props}
    />
  );
});

