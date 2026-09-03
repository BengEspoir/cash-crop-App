"use client";

import { ArrowRight } from "lucide-react";
import { startOAuth } from "@/lib/startOAuth";
import { OAuthProviderIcon } from "./OAuthProviderIcon";

const buttonClassName = "group inline-flex h-11 w-full items-center justify-center gap-3 rounded-[12px] border border-ink-200 bg-white px-4 text-[13px] font-semibold text-ink-800 shadow-soft transition-all duration-200 hover:-translate-y-[1px] hover:border-green-200 hover:shadow-lift";

export function RegistrationOAuthOptions() {
  return (
    <div className="pt-2">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-ink-200" />
        <p className="text-[12px] font-semibold text-ink-500">Or continue with</p>
        <div className="h-px flex-1 bg-ink-200" />
      </div>
      <div className="mt-4 space-y-2">
        <button type="button" onClick={() => startOAuth("google")} className={buttonClassName}>
          <OAuthProviderIcon provider="google" />
          Continue with Google
          <ArrowRight className="h-4 w-4 opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => startOAuth("apple")} className={buttonClassName}>
          <OAuthProviderIcon provider="apple" className="text-black" />
          Continue with Apple
          <ArrowRight className="h-4 w-4 opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => startOAuth("facebook")} className={buttonClassName}>
          <OAuthProviderIcon provider="facebook" className="text-[#1877F2]" />
          Continue with Facebook
          <ArrowRight className="h-4 w-4 opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
