import toast from "react-hot-toast";
import { supabase } from "./supabaseClient";

/**
 * Start Supabase OAuth; callback exchanges session for AgriculNet JWTs.
 * @param {"google"|"apple"|"facebook"} provider
 */
export async function startOAuth(provider) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "");
  const redirectTo = `${baseUrl}/oauth/callback?provider=${encodeURIComponent(provider)}`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });
  if (error) {
    toast.error(error.message || "OAuth sign-in failed.");
  }
}
