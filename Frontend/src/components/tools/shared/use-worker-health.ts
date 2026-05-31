"use client";

import { useCallback, useEffect, useState } from "react";

export const WORKERS_START_HINT =
  "Run Services/start-all-workers.bat (ports 8100–8110) and Backend on :4000 — auto-check every 5s";

export function useWorkerHealth<T extends { ok: boolean }>(
  check: () => Promise<T>,
  intervalMs = 5000,
) {
  const [data, setData] = useState<T | null>(null);

  const recheck = useCallback(async () => {
    try {
      setData(await check());
    } catch {
      setData({ ok: false } as T);
    }
  }, [check]);

  useEffect(() => {
    void recheck();
    const onFocus = () => void recheck();
    window.addEventListener("focus", onFocus);
    const id = window.setInterval(() => void recheck(), intervalMs);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.clearInterval(id);
    };
  }, [recheck, intervalMs]);

  return { healthy: data?.ok ?? null, data, recheck };
}
