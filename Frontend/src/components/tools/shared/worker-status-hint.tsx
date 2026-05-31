"use client";

import { WORKERS_START_HINT } from "./use-worker-health";

export function WorkerStatusHint({ healthy }: { healthy: boolean | null }) {
  if (healthy === null) {
    return <p className="text-xs text-muted-foreground">Checking worker…</p>;
  }
  if (healthy === false) {
    return <p className="text-xs text-amber-500">{WORKERS_START_HINT}</p>;
  }
  return null;
}
