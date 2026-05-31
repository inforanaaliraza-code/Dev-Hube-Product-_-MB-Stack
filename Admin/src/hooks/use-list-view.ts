"use client";

import { useCallback, useEffect, useState } from "react";

export type ListViewMode = "table" | "grid";

export function useListView(storageKey: string, defaultMode: ListViewMode = "table") {
  const [view, setViewState] = useState<ListViewMode>(defaultMode);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`admin-list-view:${storageKey}`);
      if (stored === "table" || stored === "grid") {
        setViewState(stored);
      }
    } catch {
      setViewState(defaultMode);
    }
  }, [storageKey, defaultMode]);

  const setView = useCallback(
    (mode: ListViewMode) => {
      setViewState(mode);
      try {
        localStorage.setItem(`admin-list-view:${storageKey}`, mode);
      } catch {
        void 0;
      }
    },
    [storageKey],
  );

  return { view, setView };
}
