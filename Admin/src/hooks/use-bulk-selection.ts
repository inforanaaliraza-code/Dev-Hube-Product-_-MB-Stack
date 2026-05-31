"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

function setsEqual<T>(a: Set<T>, b: Set<T>) {
  if (a.size !== b.size) return false;
  for (const id of a) {
    if (!b.has(id)) return false;
  }
  return true;
}

export function useBulkSelection<T extends string>(itemIds: T[]) {
  const [selected, setSelected] = useState<Set<T>>(new Set());
  const idsKey = useMemo(() => itemIds.join("\0"), [itemIds]);

  useEffect(() => {
    setSelected((prev) => {
      const valid = new Set(itemIds);
      const next = new Set<T>();
      for (const id of prev) {
        if (valid.has(id)) next.add(id);
      }
      if (setsEqual(prev, next)) return prev;
      return next;
    });
  }, [idsKey]);

  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  const toggle = useCallback((id: T) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) => {
      if (itemIds.length > 0 && itemIds.every((id) => prev.has(id))) {
        return prev.size === 0 ? prev : new Set();
      }
      const next = new Set(itemIds);
      if (setsEqual(prev, next)) return prev;
      return next;
    });
  }, [idsKey]);

  const clear = useCallback(() => {
    setSelected((prev) => (prev.size === 0 ? prev : new Set()));
  }, []);

  const isAllSelected =
    itemIds.length > 0 && itemIds.every((id) => selected.has(id));
  const isSomeSelected = selected.size > 0;

  return {
    selected,
    selectedIds,
    toggle,
    toggleAll,
    clear,
    isAllSelected,
    isSomeSelected,
    count: selected.size,
  };
}
