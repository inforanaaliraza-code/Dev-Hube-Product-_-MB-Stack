import { ApiError } from "@/lib/api";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api/v1";

export type ResumePayload = {
  fullName: string;
  jobTitle: string;
  summary?: string;
  experience?: string;
  skills?: string;
  education?: string;
};

export function getWorkerHealth() {
  return fetch(`${API_BASE}/ai-resume-builder/health`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  }).then(async (res) => {
    if (!res.ok) throw new ApiError("Health check failed", res.status);
    return (await res.json()) as { ok: boolean; configured: boolean };
  });
}

export async function generateResume(payload: ResumePayload) {
  const res = await fetch(`${API_BASE}/ai-resume-builder/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
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
    resumeMarkdown: string;
    workerAvailable: boolean;
    aiConfigured: boolean;
  };
}
