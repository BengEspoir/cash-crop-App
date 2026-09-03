import { FaApple, FaFacebookF } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { cn } from "@/lib/utils";

const providerIcons = {
  apple: FaApple,
  facebook: FaFacebookF,
  google: FcGoogle,
};

export function OAuthProviderIcon({ provider, className }) {
  const Icon = providerIcons[provider];

  if (!Icon) return null;

  return <Icon className={cn("h-5 w-5 shrink-0", className)} aria-hidden="true" />;
}
