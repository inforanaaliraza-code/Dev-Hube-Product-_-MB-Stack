"use client";

import type { ReactNode } from "react";
import { useSiteSettings } from "@/hooks/use-site-settings";

export function MaintenanceGate({ children }: { children: ReactNode }) {
  const { settings, loaded } = useSiteSettings();

  if (!loaded) return children;

  if (settings.maintenanceMode) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <h1 className="font-display text-3xl font-semibold mb-2">{settings.siteName}</h1>
        <p className="text-muted-foreground max-w-md">
          We are performing scheduled maintenance. Please check back shortly.
        </p>
      </div>
    );
  }

  return children;
}
