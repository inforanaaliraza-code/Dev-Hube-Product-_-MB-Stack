import { ApiError } from "@/lib/api";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api/v1";

export async function previewMarkdown(markdown: string) {
  const res = await fetch(`${API_BASE}/markdown-editor/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ markdown }),
    cache: "no-store",
  });
  if (!res.ok) throw new ApiError("Preview failed", res.status);
  return (await res.json()) as { html: string };
}
