"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, Camera, ChevronDown, Search, Sparkles, User } from "lucide-react";
import { BrandLogo } from "../common/BrandLogo";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import useAuth from "../../hooks/useAuth";
import { useI18n } from "../../i18n/I18nProvider";
import { startOAuth } from "../../lib/startOAuth";
import { CountrySelector } from "../common/CountrySelector";
import { cropSearchOptions } from "../../lib/cropSearch";
import { OAuthProviderIcon } from "../auth/OAuthProviderIcon";

const ROLE_HEADER_LINKS = {
  admin: {
    dashboard: "/admin/dashboard",
    notifications: "/admin/dashboard",
    orders: "/admin/orders",
    messages: null,
    account: "/admin/settings",
    settings: "/admin/settings",
  },
  farmer: {
    dashboard: "/farmer/dashboard",
    notifications: "/farmer/notifications",
    orders: "/farmer/orders",
    messages: "/farmer/messages",
    account: "/farmer/profile",
    settings: "/farmer/settings",
  },
  buyer: {
    dashboard: "/buyer/dashboard",
    notifications: "/buyer/notifications",
    orders: "/buyer/orders",
    messages: "/buyer/messages",
    account: "/buyer/profile",
    settings: "/buyer/settings",
  },
};

export function getHeaderLinks(role) {
  if (["admin", "super_admin"].includes(role)) return ROLE_HEADER_LINKS.admin;
  if (["farmer", "reseller"].includes(role)) return ROLE_HEADER_LINKS.farmer;
  return ROLE_HEADER_LINKS.buyer;
}
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [query, setQuery] = useState("");
  const [crop, setCrop] = useState("");
  const menuRootRef = useRef(null);
  const { user, isAuthenticated, logout } = useAuth();
  const { locale, setLocale, t } = useI18n();
  const accountLinks = getHeaderLinks(user?.role);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!openMenu) return undefined;

    const closeOnOutsidePress = (event) => {
      if (!menuRootRef.current?.contains(event.target)) setOpenMenu(null);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpenMenu(null);
    };

    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [openMenu]);

  function openAssistant(prompt) {
    window.dispatchEvent(new CustomEvent("agriculnet:open-assistant", { detail: { prompt } }));
  }


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
            className="flex min-h-12 flex-1 items-stretch overflow-hidden rounded-[10px] border border-ink-300 bg-white shadow-sm transition-colors duration-200 focus-within:border-green-800 focus-within:ring-4 focus-within:ring-green-800/10"
          >
            <div className="relative hidden min-w-[128px] items-center border-r border-ink-200 bg-ink-50 lg:flex">
              <select
                name="crop"
                value={crop}
                onChange={(event) => setCrop(event.target.value)}
                aria-label="Crop category"
                className="h-full w-full appearance-none border-0 bg-transparent py-0 pl-4 pr-9 text-[12px] font-semibold text-ink-700 outline-none"
              >
                {cropSearchOptions.map((option) => (
                  <option key={option} value={option === "All crops" ? "" : option}>{option}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 h-3.5 w-3.5 text-ink-500" aria-hidden="true" />
            </div>
            <div className="flex flex-1 items-center gap-2 px-3">
              <Search className="h-4 w-4 text-ink-500" aria-hidden="true" />
              <input
                type="search"
                name="query"
                placeholder={t("header.searchPlaceholder")}
                aria-label={t("header.searchPlaceholder")}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-11 w-full border-0 bg-transparent p-0 text-[13px] text-ink-800 outline-none placeholder:text-ink-400"
              />
            </div>
            <Link
              href="/browse?mode=image"
              className="inline-flex w-11 items-center justify-center border-l border-ink-200 text-ink-500 transition-colors hover:bg-green-50 hover:text-green-800"
              aria-label="Search using a crop image"
              title="Search using a crop image"
            >
              <Camera className="h-4 w-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => openAssistant(query.trim() ? `Help me find crops matching: ${query.trim()}` : "Help me source a crop on AgriculNet.")}
              className="inline-flex w-11 items-center justify-center border-l border-ink-200 text-green-800 transition-colors hover:bg-green-50"
              aria-label="Ask AgriculNet AI"
              title="Ask AgriculNet AI"
            >
              <Sparkles className="h-4 w-4" />
            </button>
            <Button
              type="submit"
              className="m-1 min-h-10 rounded-[8px] border-0 bg-[#1E5E27] px-5 text-[12px] font-semibold text-white shadow-sm hover:bg-green-900"
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
                  "min-h-10 rounded-full px-3 py-1 transition-colors",
                  locale === "en" ? "bg-green-800 text-white" : "text-ink-600 hover:text-green-800",
                )}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLocale("fr")}
                className={cn(
                  "min-h-10 rounded-full px-3 py-1 transition-colors",
                  locale === "fr" ? "bg-green-800 text-white" : "text-ink-600 hover:text-green-800",
                )}
              >
                FR
              </button>
            </div>

            {isAuthenticated ? (
              <>
                <Button asChild variant="secondary" className="h-11 w-11 px-0" aria-label={t("header.notifications")}>
                  <Link href={accountLinks.notifications}>
                    <Bell className="h-4 w-4" />
                  </Link>
                </Button>

                <div ref={menuRootRef} className="group relative">
                  <Button
                    type="button"
                    className="h-11 w-11 px-0"
                    aria-label={t("header.accountMenu")}
                    aria-expanded={openMenu === "account"}
                    aria-controls="header-account-menu"
                    onClick={() => setOpenMenu((current) => current === "account" ? null : "account")}
                  >
                    <User className="h-5 w-5" />
                  </Button>
                  <div
                    id="header-account-menu"
                    className={cn(
                      "absolute right-0 top-full z-50 mt-2 w-56 rounded-[12px] border border-ink-200 bg-white p-2 shadow-soft transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100",
                      openMenu === "account" ? "visible opacity-100" : "invisible opacity-0",
                    )}
                  >
                    <p className="px-3 py-2 text-[12px] font-semibold text-ink-500">{user?.email || "AgriculNet"}</p>
                    <Link href={accountLinks.dashboard} className="block rounded-[8px] px-3 py-2 text-[13px] text-ink-800 hover:bg-ink-50">
                      {t("header.myAgriculNet")}
                    </Link>
                    <Link href={accountLinks.orders} className="block rounded-[8px] px-3 py-2 text-[13px] text-ink-800 hover:bg-ink-50">
                      {t("header.orders")}
                    </Link>
                    {accountLinks.messages ? (
                      <Link href={accountLinks.messages} className="block rounded-[8px] px-3 py-2 text-[13px] text-ink-800 hover:bg-ink-50">
                        {t("header.messages")}
                      </Link>
                    ) : null}
                    <Link href={accountLinks.account} className="block rounded-[8px] px-3 py-2 text-[13px] text-ink-800 hover:bg-ink-50">
                      {t("header.account")}
                    </Link>
                    <Link href={accountLinks.settings} className="block rounded-[8px] px-3 py-2 text-[13px] text-ink-800 hover:bg-ink-50">
                      {t("header.settings")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        void logout();
                      }}
                      className="mt-1 block w-full rounded-[8px] px-3 py-2 text-left text-[13px] font-semibold text-red-700 hover:bg-red-50"
                    >
                      {t("common.signOut")}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div ref={menuRootRef} className="group relative inline-flex items-center">
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-gold-600 underline-offset-4 hover:text-gold-700 hover:underline"
                  >
                    <User className="h-4 w-4 text-gold-600" aria-hidden />
                    {t("common.signIn")}
                  </Link>
                  <button
                    type="button"
                    className="ml-1 inline-flex h-11 w-11 items-center justify-center rounded-full text-gold-700 hover:bg-gold-50"
                    aria-label={`${t("common.signIn")} options`}
                    aria-expanded={openMenu === "signin"}
                    aria-controls="header-signin-menu"
                    onClick={() => setOpenMenu((current) => current === "signin" ? null : "signin")}
                  >
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <div
                    id="header-signin-menu"
                    className={cn(
                      "absolute right-0 top-full z-50 mt-2 w-[280px] rounded-[14px] border border-ink-200 bg-white p-4 shadow-lift transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100",
                      openMenu === "signin" ? "visible opacity-100" : "invisible opacity-0",
                    )}
                  >
                    <Button asChild className="h-10 w-full bg-green-800 hover:bg-green-900">
                      <Link href="/auth/login">{t("common.signIn")}</Link>
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
                        <OAuthProviderIcon provider="google" />
                        Google
                      </button>
                      <button
                        type="button"
                        onClick={() => startOAuth("apple")}
                        className="flex h-11 w-full items-center justify-center gap-3 rounded-[10px] bg-black text-[13px] font-semibold text-white hover:bg-ink-900"
                      >
                        <OAuthProviderIcon provider="apple" className="text-white" />
                        Apple
                      </button>
                      <button
                        type="button"
                        onClick={() => startOAuth("facebook")}
                        className="flex h-11 w-full items-center justify-center gap-3 rounded-[10px] bg-[#1877F2] text-[13px] font-semibold text-white hover:bg-[#166FE5]"
                      >
                        <OAuthProviderIcon provider="facebook" className="text-white" />
                        Facebook
                      </button>
                    </div>
                  </div>
                </div>

                <Button asChild variant="cta" className="min-h-11">
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
