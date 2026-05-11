"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { supabase } from "@/lib/supabaseClient";
import useAuthStore from "@/store/authStore";
import { getAuthNextRoute } from "@/lib/authRoutes";
import { Card } from "@/components/ui/card";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const search = useSearchParams();
  const { setTokens, setUser, clearOnboarding } = useAuthStore();
  const [error, setError] = useState("");

  const provider = useMemo(() => search.get("provider") || "provider", [search]);

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

        const accessToken = data?.session?.access_token;
        if (!accessToken) {
          throw new Error("OAuth session could not be established.");
        }

        // Exchange Supabase identity for AgriculNet JWT tokens.
        const response = await api.post("/auth/oauth/exchange", {
          provider,
          supabaseAccessToken: accessToken,
        });

        const payload = response.data?.data;
        if (!payload?.accessToken || !payload?.refreshToken) {
          throw new Error("Token exchange failed.");
        }

        setTokens(payload.accessToken, payload.refreshToken);
        setUser(payload.user);
        clearOnboarding();

        toast.success("Signed in successfully.");
        router.replace(getAuthNextRoute(payload.nextStep || "dashboard", payload.user));
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
  }, [clearOnboarding, provider, router, search, setTokens, setUser]);

  if (error) {
    return (
      <Card className="rounded-[20px] p-6 sm:p-8">
        <p className="section-eyebrow">OAuth sign-in</p>
        <h1 className="mt-2 font-display text-[22px] text-ink-900">We couldn’t complete sign-in</h1>
        <p className="mt-3 text-[14px] text-red-700">{error}</p>
        <button
          type="button"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-[10px] bg-green-800 px-5 text-[14px] font-semibold text-white"
          onClick={() => router.replace("/sign-in")}
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

