import Link from "next/link";
import { Compass, Leaf } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

const suggestedLinks = [
  { href: "/browse", label: "Browse active listings" },
  { href: "/find-farmers", label: "Find verified farmers" },
  { href: "/help", label: "Help Center" },
  { href: "/contact", label: "Contact the AgriculNet team" },
];

export default function NotFound() {
  return (
    <div className="content-shell py-16">
      <Card className="mx-auto max-w-2xl overflow-hidden rounded-[20px] p-0">
        <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 p-8 text-white">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
            <Leaf className="h-6 w-6 text-gold-400" aria-hidden="true" />
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-100">
            404 — Not Found
          </p>
          <h1 className="mt-2 font-display text-[30px] leading-tight">
            We couldn&apos;t find that AgriculNet page
          </h1>
          <p className="mt-2 max-w-lg text-[14px] leading-6 text-white/85">
            The link may be stale, or the listing might have been taken down. Try one of the
            destinations below or jump back to the home page.
          </p>
        </div>
        <div className="space-y-4 p-8">
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/">Return home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/browse">
                <Compass className="h-4 w-4" aria-hidden="true" />
                Browse listings
              </Link>
            </Button>
          </div>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-500">
              Popular destinations
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {suggestedLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="focus-ring inline-flex items-center gap-2 rounded-md text-[13px] font-medium text-green-800 hover:text-green-900"
                  >
                    → {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
