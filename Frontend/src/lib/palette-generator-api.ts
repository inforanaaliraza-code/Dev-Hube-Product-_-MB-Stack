import { ApiError } from "@/lib/api";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api/v1";

export async function generatePalette(options: {
  mode: string;
  baseColor?: string;
  count: number;
}) {
  const res = await fetch(`${API_BASE}/palette-generator/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(options),
    cache: "no-store",
  });
  if (!res.ok) throw new ApiError("Palette generation failed", res.status);
  return (await res.json()) as {
    mode: string;
    baseColor: string;
    colors: string[];
    gradient: string;
    cssVars: string;
  };
}
