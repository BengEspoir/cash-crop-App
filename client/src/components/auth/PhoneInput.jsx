"use client";

import { useState, useEffect, useRef } from "react";
import { Label } from "../ui/label";
import { ChevronDown } from "lucide-react";
import { getCountryByCode, getInternationalCountries, getLocalCountry, getPhonePlaceholder, getAllCountries } from "../../lib/countries";

export function PhoneInput({ 
  label = "Phone Number", 
  value, 
  onChange, 
  error, 
  helper, 
  placeholder,
  countryCode = "CM",
  onCountryChange,
  showCountrySelector = false,
  includeAllCountries = false,
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(() => getCountryByCode(countryCode) || getLocalCountry());
  const dropdownRef = useRef(null);

  // Update selected country when prop changes
  useEffect(() => {
    const country = getCountryByCode(countryCode);
    if (country) {
      setSelectedCountry(country);
    }
  }, [countryCode]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get max length based on country
  const getMaxLength = () => {
    // Hardcoded lengths based on country formats
    const lengths = {
      CM: 9,  // Cameroon: 6 + 8 digits = 9 total
    };
    
    if (selectedCountry?.code && lengths[selectedCountry.code]) {
      return lengths[selectedCountry.code];
    }
    
    // Try to extract from regex pattern
    const format = selectedCountry?.phoneFormat?.source;
    if (format) {
      const formatStr = format.toString();
      // Match patterns like \d{8} or \d{8,11}
      const match = formatStr.match(/\{(\d+)(?:,(\d+))?\}/);
      if (match) {
        const maxDigits = match[2] ? parseInt(match[2]) : parseInt(match[1]);
        // Check for fixed prefix like "6" in /^6\d{8}$/
        const hasPrefix = formatStr.includes('^') && !formatStr.includes('^\\d');
        return hasPrefix ? maxDigits + 1 : maxDigits;
      }
    }
    
    return 15;
  };

  // Format value based on country
  const formatValue = (val) => {
    const digits = String(val || "").replace(/\D/g, "").slice(0, getMaxLength());
    
    // Cameroon format: XXX XXX XXX
    if (selectedCountry?.code === "CM") {
      return digits.replace(/(\d{3})(\d{0,3})(\d{0,3})/, (_, first, second, third) =>
        [first, second, third].filter(Boolean).join(" ")
      ).trim();
    }
    
    // Generic international format
    return digits;
  };

  const formattedValue = formatValue(value);

  const handleChange = (event) => {
    const digits = event.target.value.replace(/\D/g, "").slice(0, getMaxLength());
    const formatted = formatValue(digits);
    onChange(formatted);
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    onCountryChange?.(country.code);
    setIsOpen(false);
    // Clear phone when country changes
    onChange("");
  };

  const countries = showCountrySelector 
    ? (includeAllCountries ? getAllCountries() : getInternationalCountries()) 
    : [];
  const phonePlaceholder = placeholder || getPhonePlaceholder(selectedCountry?.code);

  return (
    <div ref={dropdownRef}>
      <Label>{label}</Label>
      <div className="flex overflow-hidden rounded-[8px] border border-[#D1D5DB] bg-white transition-colors duration-200 focus-within:[border-width:1.5px] focus-within:border-[#1A6B3C]">
        {/* Country Code Display / Selector */}
        <button
          type="button"
          onClick={() => showCountrySelector && !disabled && setIsOpen(!isOpen)}
          disabled={!showCountrySelector || disabled}
          className={`inline-flex items-center gap-1 border-r border-[#E5E7EB] bg-[#F9FAFB] px-3 text-[13px] font-semibold text-[#374151] ${
            showCountrySelector && !disabled ? "cursor-pointer hover:bg-[#F3F4F6]" : "cursor-default"
          }`}
        >
          <span>{selectedCountry?.flag}</span>
          <span>{selectedCountry?.dialCode}</span>
          {showCountrySelector && !disabled && (
            <ChevronDown className="h-3 w-3 text-[#9CA3AF]" />
          )}
        </button>

        {/* Phone Input */}
        <input
          value={formattedValue}
          onChange={handleChange}
          placeholder={phonePlaceholder}
          disabled={disabled}
          className="h-10 w-full border-0 bg-white px-3 text-[14px] text-[#111827] outline-none placeholder:text-[#9CA3AF] disabled:bg-[#F9FAFB] disabled:text-[#6B7280]"
        />
      </div>

      {/* Country Dropdown */}
      {isOpen && showCountrySelector && (
        <div className="absolute z-50 mt-1 max-h-60 w-72 overflow-auto rounded-lg border border-[#E5E7EB] bg-white shadow-lg">
          <div className="sticky top-0 bg-white px-3 py-2 text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB]">
            Select Country
          </div>
          {countries.map((country) => (
            <button
              key={country.code}
              type="button"
              onClick={() => handleCountrySelect(country)}
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-[14px] hover:bg-[#F3F4F6]"
            >
              <span className="text-lg">{country.flag}</span>
              <span className="flex-1 text-[#111827]">{country.name}</span>
              <span className="text-[#6B7280]">{country.dialCode}</span>
            </button>
          ))}
        </div>
      )}

      {helper ? <p className="mt-2 text-[12px] text-[#6B7280]">{helper}</p> : null}
      {error ? <p className="mt-2 text-[12px] text-[#922B21]">{error}</p> : null}
    </div>
  );
}
