import { ApiError } from "@/lib/api";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api/v1";

export type ConvertPdfOptions = {
  startPage?: number;
  endPage?: number;
};

export type ConvertPdfResult = {
  docxBase64: string;
  originalBytes: number;
  docxBytes: number;
  pageCount: number;
  convertedPages: number;
  filename: string;
  originalName: string;
  workerAvailable: boolean;
};

export function getWorkerHealth() {
  return fetch(`${API_BASE}/pdf-to-word/health`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  }).then(async (res) => {
    if (!res.ok) {
      throw new ApiError("Health check failed", res.status);
    }
    return (await res.json()) as { ok: boolean };
  });
}

export async function convertPdfToWord(
  file: File,
  options: ConvertPdfOptions = {},
): Promise<ConvertPdfResult> {
  const params = new URLSearchParams();
  if (options.startPage != null) {
    params.set("startPage", String(options.startPage));
  }
  if (options.endPage != null) {
    params.set("endPage", String(options.endPage));
  }

  const form = new FormData();
  form.append("file", file, file.name);

  const qs = params.toString();
  const url = `${API_BASE}/pdf-to-word/convert${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, {
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

  return (await res.json()) as ConvertPdfResult;
}
