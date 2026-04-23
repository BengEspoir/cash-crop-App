"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, Leaf, Search } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-ink-200 bg-white/85 backdrop-blur-md transition-shadow duration-300",
        scrolled ? "shadow-soft" : "shadow-none",
      )}
    >
      <div className="content-shell py-4 lg:py-0">
        <div className="flex min-h-[68px] flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3 lg:w-[300px] lg:flex-nowrap">
            <Link href="/" className="group flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-800 transition-all duration-200 group-hover:bg-green-800 group-hover:text-white group-hover:shadow-glow">
                <Leaf className="h-5 w-5 transition-transform duration-200 group-hover:rotate-[12deg]" />
              </span>
              <span className="font-display text-[22px] leading-none">
                <span className="text-green-800">Agricul</span>
                <span className="text-gold-700">Net</span>
              </span>
            </Link>

            <span className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-ink-50 px-3 py-1 text-[12px] font-medium text-ink-700">
              <span>Cameroon</span>
              <span aria-hidden="true">🇨🇲</span>
              <ChevronDown className="h-3.5 w-3.5 text-ink-500" />
            </span>
          </div>

          <form role="search" className="flex flex-1 items-center rounded-full border border-ink-300 bg-ink-50 p-1 transition-colors duration-200 focus-within:border-green-800 focus-within:bg-white">
            <div className="hidden items-center border-r border-ink-200 px-3 text-[12px] font-medium text-ink-700 lg:flex">
              <span>All crops</span>
              <ChevronDown className="ml-2 h-3.5 w-3.5 text-ink-500" aria-hidden="true" />
            </div>
            <div className="flex flex-1 items-center gap-2 px-3">
              <Search className="h-4 w-4 text-ink-500" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search crops, farmers, cooperatives"
                aria-label="Search crops, farmers, cooperatives"
                className="h-8 w-full border-0 bg-transparent p-0 text-[13px] text-ink-800 outline-none placeholder:text-ink-400"
              />
            </div>
            <Button type="submit" className="h-8 rounded-full px-4 text-[12px]">
              Search
            </Button>
          </form>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <div className="inline-flex items-center gap-2 rounded-full bg-ink-100 px-3 py-1 text-[12px] font-medium text-ink-700">
              <span className="text-ink-500">FR</span>
              <span className="text-ink-300">|</span>
              <span className="text-green-800">EN</span>
            </div>
            <Button asChild variant="secondary">
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/register/farmer">Register · Farmer</Link>
            </Button>
            <Button asChild>
              <Link href="/register/buyer">Register · Buyer</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
