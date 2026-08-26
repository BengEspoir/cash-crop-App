"use client";

import { usePathname } from "next/navigation";
import { PageTransition } from "../motion/PageTransition";
import { BrandPanel } from "../auth/BrandPanel";
import { resolveAuthBackground } from "../../lib/imagery";

export function AuthLayout({ children }) {
  const pathname = usePathname();
  const image = resolveAuthBackground();
  const isPreferenceRoute = pathname === "/register/preferences";
  const isRegistration = pathname?.startsWith("/register");

  if (isPreferenceRoute) {
    return (
      <div className="min-h-screen bg-white">
        <PageTransition className="min-h-screen w-full">{children}</PageTransition>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[41.67%_58.33%]">
      <div className="lg:sticky lg:top-0 lg:h-screen">
        <BrandPanel
          title="Empowering Cameroon's Agriculture"
          subtitle="Connect directly with farmers, traders, and institutional buyers across a unified agricultural marketplace."
          image={image}
          variant={isRegistration ? "registration" : "signin"}
        />
      </div>
      <div className="flex min-h-[calc(100vh-210px)] items-center justify-center bg-white px-5 py-10 sm:px-10 lg:min-h-screen lg:px-16 lg:py-12">
        <PageTransition className="w-full max-w-[520px]">
          {children}
        </PageTransition>
      </div>
    </div>
  );
}
