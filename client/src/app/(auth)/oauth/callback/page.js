"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import useAuthStore from "@/store/authStore";
import { getAuthNextRoute } from "@/lib/authRoutes";
import { Card } from "@/components/ui/card";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const search = useSearchParams();
  const { fetchMe, clearOnboarding } = useAuthStore();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        // Supabase OAuth redirect returns a `code` param (PKCE).
        const code = search.get("code");
        if (code) {
          const exchange = await supabase.auth.exchangeCodeForSession(code);
          if (exchange.error) throw exchange.error;
        }

        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!data?.session?.access_token) {
          throw new Error("OAuth session could not be established.");
        }
        const profile = await fetchMe();
        if (!profile.success) throw new Error(profile.error);
        clearOnboarding();

        toast.success("Signed in successfully.");
        router.replace(getAuthNextRoute("dashboard", profile.data.user));
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "OAuth sign-in failed. Please try again.";
        if (active) setError(message);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [clearOnboarding, fetchMe, router, search]);

  if (error) {
    return (
      <Card className="rounded-[20px] p-6 sm:p-8">
        <p className="section-eyebrow">OAuth sign-in</p>
        <h1 className="mt-2 font-display text-[22px] text-ink-900">We couldn’t complete sign-in</h1>
        <p className="mt-3 text-[14px] text-red-700">{error}</p>
        <button
          type="button"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-[10px] bg-green-800 px-5 text-[14px] font-semibold text-white"
          onClick={() => router.replace("/auth/login")}
        >
          Back to sign in
        </button>
      </Card>
    );
  }

  return (
    <Card className="rounded-[20px] p-6 sm:p-8">
      <p className="section-eyebrow">OAuth sign-in</p>
      <h1 className="mt-2 font-display text-[22px] text-ink-900">Finalizing your session…</h1>
      <p className="mt-3 text-[14px] text-ink-600">This usually takes a second.</p>
    </Card>
  );
}

