"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="content-shell py-16">
      <Card className="mx-auto max-w-2xl overflow-hidden rounded-[20px] p-0">
        <div className="bg-gradient-to-br from-[#7F1D1D] via-[#9B2226] to-[#C0392B] p-8 text-white">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
            <AlertTriangle className="h-6 w-6 text-gold-200" aria-hidden="true" />
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
            Something went wrong
          </p>
          <h1 className="mt-2 font-display text-[28px] leading-tight">
            AgriculNet hit an unexpected issue
          </h1>
          <p className="mt-2 max-w-lg text-[14px] leading-6 text-white/85">
            Try the action again. If the problem persists, head back to the home page or reach
            the support team — we&apos;ll look into it right away.
          </p>
          {error?.digest ? (
            <p className="mt-3 inline-flex rounded-md bg-black/25 px-2 py-1 font-mono text-[11px] text-white/80">
              Error ID: {error.digest}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3 p-8">
          <Button type="button" onClick={reset}>
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Return home</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/contact">Contact support</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
