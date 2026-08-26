"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import useAuthStore from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

export function SessionLifecycle() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const clearAccountData = () => {
      void queryClient.cancelQueries();
      queryClient.clear();
      const cart = useCartStore.getState();
      if (typeof cart.clearSensitiveCheckout === "function") {
        cart.clearSensitiveCheckout();
      } else {
        cart.clearCart?.();
      }
    };

    void useAuthStore.getState().hydrateSession();
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        useAuthStore.setState({ isAuthenticated: true });
        if (["SIGNED_IN", "USER_UPDATED"].includes(event)) {
          void useAuthStore.getState().fetchMe();
        }
        return;
      }

      if (event === "SIGNED_OUT") {
        clearAccountData();
        useAuthStore.setState({ user: null, isAuthenticated: false });
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [queryClient]);

  return null;
}
