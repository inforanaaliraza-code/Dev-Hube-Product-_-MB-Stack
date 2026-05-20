"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeHydration, ThemeSync } from "@/components/theme-sync";
import { makeStore, type AppStore } from "@/store/store";

export function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <Provider store={storeRef.current}>
      <TooltipProvider delayDuration={200}>
        <ThemeHydration />
        <ThemeSync />
        {children}
      </TooltipProvider>
    </Provider>
  );
}
