import { ApiError } from "@/lib/api";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api/v1";

export async function lookupWhois(domain: string) {
  const res = await fetch(`${API_BASE}/whois-lookup/lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domain }),
    cache: "no-store",
  });
  if (!res.ok) throw new ApiError("WHOIS lookup failed", res.status);
  return (await res.json()) as Record<string, unknown>;
}
