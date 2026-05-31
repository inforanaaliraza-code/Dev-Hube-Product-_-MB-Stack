import { ApiError } from "@/lib/api";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api/v1";

export function getWorkerHealth() {
  return fetch(`${API_BASE}/image-to-text/health`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  }).then(async (res) => {
    if (!res.ok) throw new ApiError("Health check failed", res.status);
    return (await res.json()) as { ok: boolean };
  });
}

export async function extractTextFromImage(file: File) {
  const form = new FormData();
  form.append("file", file, file.name);
  const res = await fetch(`${API_BASE}/image-to-text/extract`, { method: "POST", body: form, cache: "no-store" });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (body.message) message = Array.isArray(body.message) ? body.message.join(", ") : body.message;
    } catch {}
    throw new ApiError(message, res.status);
  }
  return (await res.json()) as { text: string; lineCount: number; charCount: number; originalName: string };
}
