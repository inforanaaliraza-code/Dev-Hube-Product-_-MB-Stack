import { ApiError } from "@/lib/api";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api/v1";

export function getWorkerHealth() {
  return fetch(`${API_BASE}/ai-code-generator/health`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  }).then(async (res) => {
    if (!res.ok) throw new ApiError("Health check failed", res.status);
    return (await res.json()) as {
      ok: boolean;
      configured: boolean;
      provider?: string;
      model_state?: string;
    };
  });
}

export async function generateCode(prompt: string, language: string) {
  const res = await fetch(`${API_BASE}/ai-code-generator/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ prompt, language }),
    cache: "no-store",
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (body.message) message = Array.isArray(body.message) ? body.message.join(", ") : body.message;
    } catch {}
    throw new ApiError(message, res.status);
  }
  return (await res.json()) as {
    code: string;
    language: string;
    workerAvailable: boolean;
    aiConfigured: boolean;
  };
}
