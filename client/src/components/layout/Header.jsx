"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Leaf, Search } from "lucide-react";
import { Button } from "../ui/button";

const countryOptions = [
  { name: "Cameroon", flag: "🇨🇲" },
  { name: "Ghana", flag: "🇬🇭" },
  { name: "Nigeria", flag: "🇳🇬" },
  { name: "Côte d'Ivoire", flag: "🇨🇮" },
  { name: "Kenya", flag: "🇰🇪" },
];

const languageOptions = ["EN", "FR", "ES"];
const categoryOptions = ["All crops", "Coffee", "Cocoa", "Maize", "Cassava"];

export function Header() {
  const [activeCountry, setActiveCountry] = useState(countryOptions[0]);
  const [activeLanguage, setActiveLanguage] = useState(languageOptions[0]);
  const [activeCategory, setActiveCategory] = useState(categoryOptions[0]);
  const [menuOpen, setMenuOpen] = useState({ country: false, language: false, category: false });

  const handleToggle = (key, value) => {
    setMenuOpen((state) => ({
      ...state,
      [key]: typeof value === "boolean" ? value : !state[key],
    }));
  };

  return (
    <header className="border-b border-[#E5E7EB] bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="content-shell py-5 lg:py-4">
        <div className="flex min-h-[68px] flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3 lg:w-[300px] lg:flex-nowrap">
            <Link href="/" className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF4EE] text-[#1A6B3C]">
                <Leaf className="h-5 w-5" />
              </span>
              <span className="font-display text-[22px] leading-none">
                <span className="text-[#1A6B3C]">Agricul</span>
                <span className="text-[#B5892A]">Net</span>
              </span>
            </Link>

            <div
              className="relative inline-flex"
              onMouseEnter={() => handleToggle("country", true)}
              onMouseLeave={() => handleToggle("country", false)}
            >
              <button
                type="button"
                onClick={() => handleToggle("country")}
                className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1 text-[12px] font-medium text-[#374151] transition-shadow hover:shadow-sm"
              >
                <span>{activeCountry.name}</span>
                <span aria-hidden="true">{activeCountry.flag}</span>
                <ChevronDown className="h-3.5 w-3.5 text-[#6B7280]" />
              </button>
              <div
                className={`absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] transition-opacity duration-200 ${
                  menuOpen.country ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <div className="space-y-1 px-2 py-2">
                  {countryOptions.map((country) => (
                    <button
                      type="button"
                      key={country.name}
                      onClick={() => {
                        setActiveCountry(country);
                        handleToggle("country", false);
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-[13px] text-[#111827] transition-colors hover:bg-[#EEF6F0]"
                    >
                      <span className="inline-flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                      </span>
                      {country.name === activeCountry.name ? <span className="text-[#1A6B3C]">Selected</span> : null}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <form className="flex flex-1 items-center rounded-full border border-[#D1D5DB] bg-[#F9FAFB] p-1">
            <div
              className="relative hidden items-center border-r border-[#E5E7EB] px-3 text-[12px] font-medium text-[#374151] lg:flex"
              onMouseEnter={() => handleToggle("category", true)}
              onMouseLeave={() => handleToggle("category", false)}
            >
              <button
                type="button"
                onClick={() => handleToggle("category")}
                className="inline-flex items-center gap-2 text-[12px] font-medium text-[#374151]"
              >
                <span>{activeCategory}</span>
                <ChevronDown className="h-3.5 w-3.5 text-[#6B7280]" />
              </button>
              <div
                className={`absolute left-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] transition-opacity duration-200 ${
                  menuOpen.category ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <div className="space-y-1 px-2 py-2">
                  {categoryOptions.map((category) => (
                    <button
                      type="button"
                      key={category}
                      onClick={() => {
                        setActiveCategory(category);
                        handleToggle("category", false);
                      }}
                      className="block w-full rounded-xl px-3 py-3 text-left text-[13px] text-[#111827] transition-colors hover:bg-[#EEF6F0]"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-1 items-center gap-2 px-3">
              <Search className="h-4 w-4 text-[#6B7280]" />
              <input
                type="search"
                placeholder="Search crops, farmers, cooperatives"
                className="h-8 w-full border-0 bg-transparent p-0 text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
              />
            </div>
            <Button type="submit" className="h-8 rounded-full px-4 text-[12px]">
              Search
            </Button>
          </form>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <div
              className="relative inline-flex"
              onMouseEnter={() => handleToggle("language", true)}
              onMouseLeave={() => handleToggle("language", false)}
            >
              <button
                type="button"
                onClick={() => handleToggle("language")}
                className="inline-flex items-center gap-2 rounded-full bg-[#F3F4F6] px-3 py-1 text-[12px] font-medium text-[#374151] transition-shadow hover:shadow-sm"
              >
                <span>{activeLanguage}</span>
                <ChevronDown className="h-3.5 w-3.5 text-[#6B7280]" />
              </button>
              <div
                className={`absolute right-0 top-full z-50 mt-2 w-32 overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] transition-opacity duration-200 ${
                  menuOpen.language ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <div className="space-y-1 px-2 py-2">
                  {languageOptions.map((language) => (
                    <button
                      type="button"
                      key={language}
                      onClick={() => {
                        setActiveLanguage(language);
                        handleToggle("language", false);
                      }}
                      className="block w-full rounded-xl px-3 py-3 text-left text-[13px] text-[#111827] transition-colors hover:bg-[#EEF6F0]"
                    >
                      {language}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <Button asChild variant="secondary">
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/register/farmer">Register - Farmer</Link>
            </Button>
            <Button asChild>
              <Link href="/register/buyer">Register - Buyer</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
