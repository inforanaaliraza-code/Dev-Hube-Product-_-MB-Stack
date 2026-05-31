import { ApiError } from "@/lib/api";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api/v1";

export function getWorkerHealth() {
  return fetch(`${API_BASE}/image-converter/health`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  }).then(async (res) => {
    if (!res.ok) throw new ApiError("Health check failed", res.status);
    return (await res.json()) as { ok: boolean };
  });
}
