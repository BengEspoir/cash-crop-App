"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, ChevronDown, Search, UserCircle } from "lucide-react";
import { BrandLogo } from "../common/BrandLogo";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import useAuth from "../../hooks/useAuth";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-ink-200 bg-white/90 backdrop-blur-md transition-shadow duration-300",
        scrolled ? "shadow-soft" : "shadow-none",
      )}
    >
      <div className="w-full px-4 py-4 lg:px-6 lg:py-0">
        <div className="mx-auto flex min-h-[68px] max-w-[1680px] flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3 lg:w-[300px] lg:flex-nowrap">
            <Link href="/" className="group flex items-center">
              <BrandLogo className="h-11 w-[150px]" priority />
            </Link>

            <span className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-ink-50 px-3 py-1 text-[12px] font-medium text-ink-700">
              <span>Cameroon</span>
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
                placeholder="Search crops, farmers, resellers"
                aria-label="Search crops, farmers, resellers"
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

            {isAuthenticated ? (
              <>
                <Button asChild variant="secondary" className="h-10 w-10 px-0" aria-label="Notifications">
                  <Link href="/buyer/dashboard">
                    <Bell className="h-4 w-4" />
                  </Link>
                </Button>

                <div className="group relative">
                  <Button type="button" variant="outline">Become Seller/Reseller</Button>
                  <div className="invisible absolute right-0 top-full z-50 mt-2 w-64 rounded-[12px] border border-ink-200 bg-white p-3 opacity-0 shadow-soft transition-all group-hover:visible group-hover:opacity-100">
                    <p className="px-2 pb-2 text-[12px] font-semibold text-ink-700">How do you wish to sell on AgriculNet?</p>
                    <Link href="/register/farmer" className="block rounded-[8px] px-3 py-2 text-[13px] font-medium text-ink-800 hover:bg-green-50">As Farmer</Link>
                    <Link href="/register/reseller" className="block rounded-[8px] px-3 py-2 text-[13px] font-medium text-ink-800 hover:bg-green-50">As Reseller</Link>
                  </div>
                </div>

                <div className="group relative">
                  <Button type="button" className="h-10 w-10 px-0" aria-label="Account menu">
                    <UserCircle className="h-5 w-5" />
                  </Button>
                  <div className="invisible absolute right-0 top-full z-50 mt-2 w-56 rounded-[12px] border border-ink-200 bg-white p-2 opacity-0 shadow-soft transition-all group-hover:visible group-hover:opacity-100">
                    <p className="px-3 py-2 text-[12px] font-semibold text-ink-500">{user?.email || "AgriculNet account"}</p>
                    <Link href="/buyer/dashboard" className="block rounded-[8px] px-3 py-2 text-[13px] text-ink-800 hover:bg-ink-50">My AgriculNet</Link>
                    <Link href="/buyer/orders" className="block rounded-[8px] px-3 py-2 text-[13px] text-ink-800 hover:bg-ink-50">Orders</Link>
                    <Link href="/buyer/messages" className="block rounded-[8px] px-3 py-2 text-[13px] text-ink-800 hover:bg-ink-50">Messages</Link>
                    <Link href="/buyer/profile" className="block rounded-[8px] px-3 py-2 text-[13px] text-ink-800 hover:bg-ink-50">Account</Link>
                    <Link href="/buyer/settings" className="block rounded-[8px] px-3 py-2 text-[13px] text-ink-800 hover:bg-ink-50">Settings</Link>
                    <button type="button" onClick={logout} className="mt-1 block w-full rounded-[8px] px-3 py-2 text-left text-[13px] font-semibold text-red-700 hover:bg-red-50">Sign Out</button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="group relative">
                  <Button type="button" variant="secondary">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                  <div className="invisible absolute right-0 top-full z-50 mt-2 w-60 rounded-[12px] border border-ink-200 bg-white p-3 opacity-0 shadow-soft transition-all group-hover:visible group-hover:opacity-100">
                    <Button asChild className="w-full">
                      <Link href="/sign-in">Sign In</Link>
                    </Button>
                    <button type="button" className="mt-2 w-full rounded-[8px] border border-ink-200 px-3 py-2 text-[13px] font-semibold text-ink-700" onClick={() => alert("Google sign-in is not configured yet.")}>Continue with Google</button>
                    <button type="button" className="mt-2 w-full rounded-[8px] border border-ink-200 px-3 py-2 text-[13px] font-semibold text-ink-700" onClick={() => alert("Facebook sign-in is not configured yet.")}>Continue with Facebook</button>
                  </div>
                </div>
                <Button asChild>
                  <Link href="/register">Create Account / Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
