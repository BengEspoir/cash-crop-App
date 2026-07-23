"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { createQueryClient } from "@/lib/queryClient";
import { I18nProvider } from "@/i18n/I18nProvider";
import { AgriculNetAIAssistant } from "@/components/assistant/AgriculNetAIAssistant";

export function Providers({ children }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        {children}
        <AgriculNetAIAssistant />
        <Toaster position="top-right" />
      </I18nProvider>
    </QueryClientProvider>
  );
}
