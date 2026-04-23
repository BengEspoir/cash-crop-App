"use client";

import { usePathname } from "next/navigation";
import { BrandPanel } from "../auth/BrandPanel";
import { PageTransition } from "../motion/PageTransition";
import { resolveBrandImagery } from "../../lib/imagery";

const panelContent = {
  "/sign-in": {
    eyebrow: "Sign In",
    title: "Trade verified crops with confidence.",
    subtitle:
      "Continue with your preferred sign-in method and get back to sourcing, selling, and tracking orders.",
  },
  "/register": {
    eyebrow: "Get Started",
    title: "Choose the account that fits your trade flow.",
    subtitle:
      "Set up a farmer or buyer profile with the same clear, protected onboarding pattern used across AgriculNet.",
  },
  "/register/farmer": {
    eyebrow: "Farmer Registration",
    title: "Bring your farm to verified market access.",
    subtitle:
      "Share your profile, crop readiness, and payout details so buyers can source from you with trust.",
  },
  "/register/buyer": {
    eyebrow: "Buyer Registration",
    title: "Source from Cameroon with better visibility.",
    subtitle:
      "Set up your buyer account for local procurement or international trade and keep every step documented.",
  },
  "/forgot-password": {
    eyebrow: "Recovery",
    title: "Secure access starts with a clean reset flow.",
    subtitle:
      "Choose phone or email recovery and use development hints locally when delivery providers are not configured.",
  },
  "/reset-password": {
    eyebrow: "Password Reset",
    title: "Set a stronger password before your next transaction.",
    subtitle:
      "Use the reset code you received and update the credentials that protect your account activity and payouts.",
  },
  "/verify-email": {
    eyebrow: "Email Verification",
    title: "Confirm your email to unlock the next step.",
    subtitle:
      "Verification keeps notifications, order updates, and buyer communication tied to a trusted inbox.",
  },
  "/verify-phone": {
    eyebrow: "Phone Verification",
    title: "Verify your phone for alerts and payout readiness.",
    subtitle:
      "Your mobile number powers order notifications, buyer updates, and MTN MoMo or Orange Money workflows.",
  },
  "/pending": {
    eyebrow: "Review Status",
    title: "Your account is under review.",
    subtitle:
      "We are checking profile details, trade readiness, and payout information before approval.",
  },
  "/admin-portal": {
    eyebrow: "Admin Portal",
    title: "Operational control for a trusted marketplace.",
    subtitle:
      "Sign in to moderate listings, review users, and keep disputes, payments, and inspections on track.",
  },
};

export function AuthLayout({ children }) {
  const pathname = usePathname();
  const content = panelContent[pathname] || panelContent["/sign-in"];
  const image = resolveBrandImagery(pathname);

  return (
    <div className="min-h-screen bg-ink-100 py-4 lg:py-8">
      <div className="content-shell">
        <div className="overflow-hidden rounded-[22px] border border-ink-200 bg-white shadow-soft lg:grid lg:min-h-[calc(100vh-64px)] lg:grid-cols-[0.92fr_1.08fr]">
          <BrandPanel {...content} image={image} />
          <div className="flex items-center justify-center px-4 py-6 sm:px-6 lg:px-12 lg:py-10">
            <PageTransition className="w-full max-w-[560px]">{children}</PageTransition>
          </div>
        </div>
      </div>
    </div>
  );
}
