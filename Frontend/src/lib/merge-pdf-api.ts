import { ApiError } from "@/lib/api";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api/v1";

export type MergePdfSource = {
  name: string;
  pages: number;
};

export type MergePdfResult = {
  pdfBase64: string;
  filename: string;
  fileCount: number;
  totalPages: number;
  totalBytes: number;
  inputBytes: number;
  sources: MergePdfSource[];
  workerAvailable: boolean;
};

export function getWorkerHealth() {
  return fetch(`${API_BASE}/merge-pdf/health`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  }).then(async (res) => {
    if (!res.ok) {
      throw new ApiError("Health check failed", res.status);
    }
    return (await res.json()) as { ok: boolean };
  });
}

export async function mergePdfFiles(files: File[]): Promise<MergePdfResult> {
  const form = new FormData();
  for (const file of files) {
    form.append("files", file, file.name);
  }

  const res = await fetch(`${API_BASE}/merge-pdf/merge`, {
    method: "POST",
    body: form,
    cache: "no-store",
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (body.message) {
        message = Array.isArray(body.message) ? body.message.join(", ") : body.message;
      }
    } catch {
    }
    throw new ApiError(message, res.status);
  }

  return (await res.json()) as MergePdfResult;
}
