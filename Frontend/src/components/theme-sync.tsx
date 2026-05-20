"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { hydrateTheme, type Theme } from "@/store/slices/uiSlice";

export function ThemeHydration() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      dispatch(hydrateTheme(stored));
    }
  }, [dispatch]);

  return null;
}

export function ThemeSync() {
  const theme = useAppSelector((s) => s.ui.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return null;
}

export type { Theme };
