"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LockKeyhole } from "lucide-react";

const returnPath = encodeURIComponent("/browse?resumeSearch=1");

export function AuthRequiredDialog({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[470px] rounded-[24px]">
        <DialogHeader className="items-center text-center">
          <span className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-800">
            <LockKeyhole className="h-5 w-5" aria-hidden="true" />
          </span>
          <DialogTitle className="font-display text-[28px] text-green-950">
            Sign in for smart search
          </DialogTitle>
          <DialogDescription className="max-w-sm text-[15px] leading-6">
            AI, image, and voice search use your AgriculNet account to protect
            marketplace data and prevent automated abuse. Standard text search
            remains available without signing in.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 grid gap-2 sm:grid-cols-2">
          <Button asChild className="bg-[#1E5E27] hover:bg-[#174b20]">
            <Link href={`/auth/login?next=${returnPath}`}>Sign in</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/register?next=${returnPath}`}>Create account</Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="sm:col-span-2"
            onClick={() => onOpenChange(false)}
          >
            Not now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
