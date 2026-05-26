"use client";

import { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { getAllCountries, getCountryByCode } from "@/lib/countries";
import { useSitePrefsStore } from "@/store/sitePrefsStore";
import { cn } from "@/lib/utils";

export function sortCountriesForSelector() {
  return [...getAllCountries()].sort((a, b) => {
    if (a.code === "CM") return -1;
    if (b.code === "CM") return 1;
    return a.name.localeCompare(b.name);
  });
}

export function CountrySelector({
  value,
  onChange,
  label = "Country",
  compact = false,
  allowAll = false,
  allLabel = "All countries",
  className,
  selectClassName,
}) {
  const storedCountry = useSitePrefsStore((state) => state.countryCode);
  const setStoredCountry = useSitePrefsStore((state) => state.setCountryCode);
  const countryCode = value !== undefined ? value : storedCountry || "CM";
  const countries = useMemo(sortCountriesForSelector, []);
  const selected = countryCode === "all" ? null : getCountryByCode(countryCode) || getCountryByCode("CM");

  const handleChange = (event) => {
    const next = event.target.value || "CM";
    if (next !== "all") setStoredCountry(next);
    onChange?.(next);
  };

  return (
    <label className={cn("relative inline-flex cursor-pointer items-center gap-2", className)}>
      <span className="sr-only">{label}</span>
      {compact ? (
        <span className="pointer-events-none absolute left-4 z-10 text-[15px]" aria-hidden>
          {selected?.flag || "All"}
        </span>
      ) : null}
      <select
        value={countryCode}
        onChange={handleChange}
        className={cn(
          "appearance-none rounded-full border border-ink-200 bg-ink-50 py-1.5 pl-3 pr-8 text-[12px] font-medium text-ink-800 outline-none focus:border-green-800 focus:ring-2 focus:ring-green-800/15",
          compact && "h-10 min-w-[150px] bg-white py-0 pl-10 text-[14px] font-semibold",
          selectClassName,
        )}
      >
        {allowAll ? <option value="all">{allLabel}</option> : null}
        {countries.map((country) => (
          <option key={country.code} value={country.code}>
            {country.flag} {country.name}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 h-3.5 w-3.5 text-ink-500" aria-hidden />
    </label>
  );
}

