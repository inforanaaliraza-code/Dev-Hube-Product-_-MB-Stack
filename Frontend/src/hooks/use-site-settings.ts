"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_PUBLIC_SITE,
  fetchPublicSiteSettings,
  type PublicSiteSettings,
} from "@/lib/site-settings";

export function useSiteSettings() {
  const [settings, setSettings] = useState<PublicSiteSettings>(DEFAULT_PUBLIC_SITE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchPublicSiteSettings().then((data) => {
      if (!cancelled) {
        setSettings(data);
        setLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { settings, loaded };
}
