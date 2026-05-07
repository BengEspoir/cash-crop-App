"use client";

import { AlertCircle, ShieldCheck, ShieldAlert } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import Link from "next/link";

export const VerificationBanner = () => {
  const { user } = useAuth();

  if (!user) return null;

  const isFarmer = user.role === "farmer";

  const getBannerConfig = () => {
    if (!user.email_verified) {
      return {
        icon: AlertCircle,
        bg: "bg-amber-50 border-amber-200",
        text: "text-amber-800",
        message: "Verify your email address to enter your workspace and continue account setup.",
        actions: [{ label: "Verify Email", href: "/verify-email" }]
      };
    }

    if (isFarmer && !user.phone_verified) {
      return {
        icon: AlertCircle,
        bg: "bg-amber-50 border-amber-200",
        text: "text-amber-800",
        message: "Complete your profile by verifying your phone number. Next, complete National ID verification with live camera and image upload.",
        actions: [{ label: "Verify Phone", href: "/verify-phone" }]
      };
    }

    if (!isFarmer && !user.phone_verified) {
      return {
        icon: AlertCircle,
        bg: "bg-amber-50 border-amber-200",
        text: "text-amber-800",
        message: "Complete verification by verifying your phone number.",
        actions: [{ label: "Verify Phone", href: "/verify-phone" }]
      };
    }

    if (isFarmer && user.status === "pending_verification") {
      return {
        icon: ShieldAlert,
        bg: "bg-orange-50 border-orange-200",
        text: "text-orange-800",
        message: "Complete your farmer profile with National ID verification, live camera capture, and image upload.",
        actions: [{ label: "Verify Identity", href: "/farmer/verify-identity" }]
      };
    }

    switch (user.status) {
      case "pending_verification":
        return {
          icon: AlertCircle,
          bg: "bg-amber-50 border-amber-200",
          text: "text-amber-800",
          message: isFarmer
            ? "Complete your profile by verifying your phone number. Next, complete National ID verification with live camera and image upload."
            : "Complete verification by verifying your phone number.",
          actions: [{ label: "Verify Phone", href: "/verify-phone" }]
        };
      case "pending_identity_verification":
        return {
          icon: ShieldAlert,
          bg: "bg-orange-50 border-orange-200",
          text: "text-orange-800",
          message: "Complete your farmer profile with National ID verification, live camera capture, and image upload.",
          actions: [{ label: "Verify Identity", href: "/farmer/verify-identity" }]
        };
      case "pending_review":
        return {
          icon: ShieldCheck,
          bg: "bg-blue-50 border-blue-200",
          text: "text-blue-800",
          message: "Your profile is currently under review by our admin team. You will be notified once your account is fully active.",
          actions: []
        };
      default:
        return null;
    }
  };

  const config = getBannerConfig();
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className={`mt-4 rounded-xl border p-4 ${config.bg} ${config.text}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-[14px] font-medium leading-relaxed">
            {config.message}
          </p>
          {config.actions?.length ? (
            <div className="mt-3 flex flex-wrap gap-3">
              {config.actions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="inline-block text-[13px] font-bold underline hover:opacity-80"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
