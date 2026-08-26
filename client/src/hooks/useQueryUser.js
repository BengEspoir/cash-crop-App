"use client";

import useAuthStore from "@/store/authStore";

export const useQueryUserId = () => useAuthStore((state) => state.user?.id || null);
