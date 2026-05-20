"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTheme, toggleTheme, type Theme } from "@/store/slices/uiSlice";

export function useTheme() {
  const theme = useAppSelector((s) => s.ui.theme);
  const dispatch = useAppDispatch();

  return {
    theme,
    toggle: () => dispatch(toggleTheme()),
    setTheme: (t: Theme) => dispatch(setTheme(t)),
  };
}
