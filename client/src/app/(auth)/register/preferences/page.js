"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Coffee, Flower2, Leaf, Loader2, Sprout, Trees, Wheat } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { useI18n } from "../../../../i18n/I18nProvider";
import { getAuthNextRoute } from "../../../../lib/authRoutes";
import { cn } from "../../../../lib/utils";
import useAuthStore from "../../../../store/authStore";

const commodities = [
  { name: "Coffee", description: "Arabica and Robusta varieties", Icon: Coffee },
  { name: "Cocoa", description: "Beans and processed cocoa", Icon: Sprout },
  { name: "Rubber", description: "Natural rubber and latex", Icon: Leaf },
  { name: "Oil Palm", description: "Palm fruit and palm oil", Icon: Trees },
  { name: "Cotton", description: "Raw cotton and fibre", Icon: Flower2 },
  { name: "Timber", description: "Responsibly sourced timber", Icon: Wheat },
];

export default function SellerPreferencesPage() {
  const router = useRouter();
  const { t } = useI18n();
  const copy = (key, fallback) => t(`auth.sellerPreferences.${key}`) || fallback;
  const onboarding = useAuthStore((state) => state.onboarding);
  const syncOnboarding = useAuthStore((state) => state.syncOnboarding);
  const setOnboarding = useAuthStore((state) => state.setOnboarding);
  const [hasCheckedState, setHasCheckedState] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const existingSelections = useMemo(() => {
    const profile = onboarding?.pendingProfile || {};
    const crops = onboarding?.role === "farmer" ? profile.crops_grown : profile.crops_sold;
    if (Array.isArray(crops) && crops.length) return crops;
    return profile.primary_crop ? [profile.primary_crop] : [];
  }, [onboarding]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    syncOnboarding();
    setHasCheckedState(true);
  }, [syncOnboarding]);

  useEffect(() => {
    if (existingSelections.length) setSelected(existingSelections);
  }, [existingSelections]);

  useEffect(() => {
    if (!hasCheckedState) return;
    if (!onboarding || !["farmer", "reseller"].includes(onboarding.role)) {
      router.replace("/register");
    }
  }, [hasCheckedState, onboarding, router]);

  const toggleSelection = (name) => {
    setSelected((current) => (
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name]
    ));
  };

  const continueToVerification = (saveSelections) => {
    if (!onboarding) return;
    setIsContinuing(true);
    if (saveSelections) {
      const pendingProfile = {
        ...(onboarding.pendingProfile || {}),
        primary_crop: selected[0],
        ...(onboarding.role === "farmer" ? { crops_grown: selected } : { crops_sold: selected }),
      };
      setOnboarding({ pendingProfile, sellerPreferencesComplete: true });
    } else {
      setOnboarding({ sellerPreferencesComplete: true });
    }
    router.push(getAuthNextRoute(onboarding.nextStep, { role: onboarding.role }));
  };

  if (!hasCheckedState || !onboarding || !["farmer", "reseller"].includes(onboarding.role)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-[#1E5E27]" aria-label="Loading registration preferences" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <div className="mx-auto max-w-[1160px]">
        <div className="flex items-center gap-4 text-[13px] font-semibold text-[#1E5E27]">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E5E27] text-white">2</span>
          <span>{copy("step", "Tell us what you sell")}</span>
          <span className="h-px flex-1 bg-[#DDE6DE]" aria-hidden="true" />
        </div>

        <header className="mx-auto mt-12 max-w-[780px] text-center">
          <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-[#1E5E27]">{copy("eyebrow", "Seller preferences")}</p>
          <h1 className="mt-4 font-display text-[34px] leading-[1.12] text-[#152218] sm:text-[46px]">
            {copy("title", "Which cash crops would you like to sell on AgriculNet?")}
          </h1>
          <p className="mx-auto mt-5 max-w-[680px] text-[15px] leading-7 text-[#66736A]">
            {copy("subtitle", "Select the primary commodities you plan to sell or supply. We'll tailor your feed to these interests.")}
          </p>
        </header>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Cash crop preferences">
          {commodities.map(({ name, description, Icon }) => {
            const isSelected = selected.includes(name);
            return (
              <button
                key={name}
                type="button"
                aria-pressed={isSelected}
                disabled={isContinuing}
                onClick={() => toggleSelection(name)}
                className={cn(
                  "group relative flex min-h-[190px] flex-col items-center justify-center rounded-[14px] border bg-white px-6 py-7 text-center outline-none transition-all duration-200 focus-visible:ring-4 focus-visible:ring-[#1E5E27]/15 disabled:cursor-not-allowed disabled:opacity-60",
                  isSelected
                    ? "border-[#1E5E27] bg-[#F2F8F3] shadow-[0_8px_28px_rgba(30,94,39,0.08)]"
                    : "border-[#DCE3DD] hover:-translate-y-0.5 hover:border-[#77A37D] hover:shadow-[0_8px_24px_rgba(20,48,25,0.07)]",
                )}
              >
                <span className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-full bg-[#F2F5F2] text-[#1E5E27] transition-colors",
                  isSelected && "bg-[#1E5E27] text-white",
                )}>
                  <Icon className="h-7 w-7" strokeWidth={1.7} />
                </span>
                <span className="mt-4 text-[17px] font-bold text-[#18221A]">{name}</span>
                <span className="mt-1 text-[13px] text-[#748078]">{description}</span>
                {isSelected ? (
                  <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#1E5E27] text-white">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mx-auto mt-9 max-w-[760px]">
          <Button
            type="button"
            className="h-12 w-full bg-[#1E5E27] text-[14px] hover:bg-[#174B20]"
            disabled={!selected.length || isContinuing}
            onClick={() => continueToVerification(true)}
          >
            {isContinuing ? "Continuing..." : `${copy("save", "Save preferences")}${selected.length ? ` (${selected.length})` : ""}`}
          </Button>
          <button
            type="button"
            disabled={isContinuing}
            onClick={() => continueToVerification(false)}
            className="mt-5 w-full text-center text-[13px] font-semibold text-[#56645A] underline-offset-4 hover:text-[#1E5E27] hover:underline disabled:opacity-60"
          >
            {copy("skip", "Skip for now... proceed to dashboard")}
          </button>
          <p className="mt-3 text-center text-[12px] leading-5 text-[#7B867E]">
            {copy("verificationNote", "Your account verification steps still need to be completed before dashboard access.")}
          </p>
        </div>
      </div>
    </main>
  );
}
