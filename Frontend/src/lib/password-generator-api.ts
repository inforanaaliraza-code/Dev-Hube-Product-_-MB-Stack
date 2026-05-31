import { ApiError } from "@/lib/api";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api/v1";

export async function generatePassword(options: {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}) {
  const res = await fetch(`${API_BASE}/password-generator/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(options),
    cache: "no-store",
  });
  if (!res.ok) throw new ApiError("Generate failed", res.status);
  return (await res.json()) as { password: string; length: number; strength: string };
}

export async function checkPasswordBreach(password: string) {
  const res = await fetch(`${API_BASE}/password-generator/check-breach`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ password }),
    cache: "no-store",
  });
  if (!res.ok) throw new ApiError("Breach check failed", res.status);
  return (await res.json()) as { breached: boolean; breachCount: number; strength: string };
}
