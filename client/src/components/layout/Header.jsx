"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, ChevronDown, Search, User } from "lucide-react";
import { BrandLogo } from "../common/BrandLogo";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import useAuth from "../../hooks/useAuth";
import { useI18n } from "../../i18n/I18nProvider";
import { startOAuth } from "../../lib/startOAuth";
import { CountrySelector } from "../common/CountrySelector";

function GoogleGlyph({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function AppleGlyph({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M16.365 1.43c0 1.14-.493 2.276-1.11 3.08-.744.906-1.64 1.377-2.645 1.377-.126 0-.252-.012-.38-.03-.015-.89.36-1.8.996-2.533.69-.813 1.924-1.447 3.14-1.894zM20.335 17.07c-.57 1.545-1.19 2.97-2.13 4.36-.996 1.455-2.01 2.923-3.64 2.923-1.395 0-1.85-.828-3.45-.828-1.602 0-2.09.796-3.458.828-1.38.034-2.43-1.378-3.42-2.828-1.86-2.7-3.28-7.62-1.37-10.94 1.01-1.79 2.824-2.918 4.79-2.96 1.18-.03 2.3.784 3.042.784.72 0 2.07-.866 3.48-.74.59.025 2.26.24 3.33 1.82-.09.06-1.99 1.19-1.97 3.55.02 2.82 2.48 3.76 2.51 3.77-.02.08-.39 1.35-1.28 2.68z"
      />
    </svg>
  );
}

function FacebookGlyph({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { locale, setLocale, t } = useI18n();

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
        <div className="mx-auto flex min-h-[72px] w-full max-w-none flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3 lg:w-[320px] lg:flex-nowrap">
            <Link href="/" className="group flex items-center">
              <BrandLogo className="h-11 w-[156px] sm:h-12 sm:w-[180px]" priority />
            </Link>

            <CountrySelector
              label={t("common.country")}
              className="w-full sm:w-auto"
              selectClassName="w-full max-w-none sm:max-w-[200px]"
            />
          </div>

          <form
            action="/browse"
            method="get"
            role="search"
            className="flex flex-1 items-center rounded-full border border-ink-300 bg-ink-50 p-1 transition-colors duration-200 focus-within:border-green-800 focus-within:bg-white"
          >
            <div className="hidden items-center border-r border-ink-200 px-3 text-[12px] font-medium text-ink-700 lg:flex">
              <span>{t("common.allCrops")}</span>
              <ChevronDown className="ml-2 h-3.5 w-3.5 text-ink-500" aria-hidden="true" />
            </div>
            <div className="flex flex-1 items-center gap-2 px-3">
              <Search className="h-4 w-4 text-ink-500" aria-hidden="true" />
              <input
                type="search"
                name="query"
                placeholder={t("header.searchPlaceholder")}
                aria-label={t("header.searchPlaceholder")}
                defaultValue=""
                className="h-8 w-full border-0 bg-transparent p-0 text-[13px] text-ink-800 outline-none placeholder:text-ink-400"
              />
            </div>
            <Button
              type="submit"
              className="h-8 rounded-full border-0 bg-gold-400 px-4 text-[12px] font-semibold text-brand-secondaryFg shadow-sm hover:bg-gold-500"
            >
              {t("common.search")}
            </Button>
          </form>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <div
              className="inline-flex items-center rounded-full border border-ink-200 bg-white p-0.5 text-[12px] font-semibold"
              role="group"
              aria-label={t("common.language")}
            >
              <button
                type="button"
                onClick={() => setLocale("en")}
                className={cn(
                  "rounded-full px-3 py-1 transition-colors",
                  locale === "en" ? "bg-green-800 text-white" : "text-ink-600 hover:text-green-800",
                )}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLocale("fr")}
                className={cn(
                  "rounded-full px-3 py-1 transition-colors",
                  locale === "fr" ? "bg-green-800 text-white" : "text-ink-600 hover:text-green-800",
                )}
              >
                FR
              </button>
            </div>

            {isAuthenticated ? (
              <>
                <Button asChild variant="secondary" className="h-10 w-10 px-0" aria-label={t("header.notifications")}>
                  <Link href="/buyer/dashboard">
                    <Bell className="h-4 w-4" />
                  </Link>
                </Button>

                <div className="group relative">
                  <Button type="button" className="h-10 w-10 px-0" aria-label={t("header.accountMenu")}>
                    <User className="h-5 w-5" />
                  </Button>
                  <div className="invisible absolute right-0 top-full z-50 mt-2 w-56 rounded-[12px] border border-ink-200 bg-white p-2 opacity-0 shadow-soft transition-all group-hover:visible group-hover:opacity-100">
                    <p className="px-3 py-2 text-[12px] font-semibold text-ink-500">{user?.email || "AgriculNet"}</p>
                    <Link href="/buyer/dashboard" className="block rounded-[8px] px-3 py-2 text-[13px] text-ink-800 hover:bg-ink-50">
                      {t("header.myAgriculNet")}
                    </Link>
                    <Link href="/buyer/orders" className="block rounded-[8px] px-3 py-2 text-[13px] text-ink-800 hover:bg-ink-50">
                      {t("header.orders")}
                    </Link>
                    <Link href="/buyer/messages" className="block rounded-[8px] px-3 py-2 text-[13px] text-ink-800 hover:bg-ink-50">
                      {t("header.messages")}
                    </Link>
                    <Link href="/buyer/profile" className="block rounded-[8px] px-3 py-2 text-[13px] text-ink-800 hover:bg-ink-50">
                      {t("header.account")}
                    </Link>
                    <Link href="/buyer/settings" className="block rounded-[8px] px-3 py-2 text-[13px] text-ink-800 hover:bg-ink-50">
                      {t("header.settings")}
                    </Link>
                    <button
                      type="button"
                      onClick={logout}
                      className="mt-1 block w-full rounded-[8px] px-3 py-2 text-left text-[13px] font-semibold text-red-700 hover:bg-red-50"
                    >
                      {t("common.signOut")}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="group relative inline-flex items-center">
                  <Link
                    href="/sign-in"
                    className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-gold-600 underline-offset-4 hover:text-gold-700 hover:underline"
                  >
                    <User className="h-4 w-4 text-gold-600" aria-hidden />
                    {t("common.signIn")}
                  </Link>
                  <div className="invisible absolute right-0 top-full z-50 mt-2 w-[280px] rounded-[14px] border border-ink-200 bg-white p-4 opacity-0 shadow-lift transition-all group-hover:visible group-hover:opacity-100">
                    <Button asChild className="h-10 w-full bg-green-800 hover:bg-green-900">
                      <Link href="/sign-in">{t("common.signIn")}</Link>
                    </Button>
                    <p className="mt-3 text-center text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                      {t("common.continueWith")}
                    </p>
                    <div className="mt-3 space-y-2">
                      <button
                        type="button"
                        onClick={() => startOAuth("google")}
                        className="flex h-11 w-full items-center justify-center gap-3 rounded-[10px] bg-[#F8F9FA] text-[13px] font-semibold text-ink-900 ring-1 ring-ink-200 hover:bg-ink-50"
                      >
                        <GoogleGlyph className="h-5 w-5" />
                        Google
                      </button>
                      <button
                        type="button"
                        onClick={() => startOAuth("apple")}
                        className="flex h-11 w-full items-center justify-center gap-3 rounded-[10px] bg-black text-[13px] font-semibold text-white hover:bg-ink-900"
                      >
                        <AppleGlyph className="h-5 w-5 text-white" />
                        Apple
                      </button>
                      <button
                        type="button"
                        onClick={() => startOAuth("facebook")}
                        className="flex h-11 w-full items-center justify-center gap-3 rounded-[10px] bg-[#1877F2] text-[13px] font-semibold text-white hover:bg-[#166FE5]"
                      >
                        <FacebookGlyph className="h-5 w-5" />
                        Facebook
                      </button>
                    </div>
                  </div>
                </div>

                <Button asChild variant="cta" className="h-10">
                  <Link href="/register/buyer">{t("common.createAccount")}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
