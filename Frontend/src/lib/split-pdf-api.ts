import { ApiError } from "@/lib/api";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api/v1";

export type SplitPdfOptions = {
  mode?: "range" | "each";
  startPage?: number;
  endPage?: number;
};

export type SplitPdfRangeResult = {
  mode: "range";
  pdfBase64: string;
  filename: string;
  pageCount: number;
  splitPages: number;
  startPage: number;
  endPage: number;
  outputBytes: number;
  originalName: string;
  originalBytes: number;
  workerAvailable: boolean;
};

export type SplitPdfEachResult = {
  mode: "each";
  zipBase64: string;
  filename: string;
  pageCount: number;
  fileCount: number;
  outputBytes: number;
  originalName: string;
  originalBytes: number;
  workerAvailable: boolean;
};

export type SplitPdfResult = SplitPdfRangeResult | SplitPdfEachResult;

export async function inspectPdfFile(file: File) {
  const form = new FormData();
  form.append("file", file, file.name);
  const res = await fetch(`${API_BASE}/split-pdf/inspect`, {
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
    } catch {}
    throw new ApiError(message, res.status);
  }
  return (await res.json()) as { pageCount: number; workerAvailable: boolean };
}

export function getWorkerHealth() {
  return fetch(`${API_BASE}/split-pdf/health`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  }).then(async (res) => {
    if (!res.ok) {
      throw new ApiError("Health check failed", res.status);
    }
    return (await res.json()) as { ok: boolean };
  });
}

export async function splitPdfFile(
  file: File,
  options: SplitPdfOptions = {},
): Promise<SplitPdfResult> {
  const params = new URLSearchParams();
  params.set("mode", options.mode ?? "range");
  if (options.startPage != null) {
    params.set("startPage", String(options.startPage));
  }
  if (options.endPage != null) {
    params.set("endPage", String(options.endPage));
  }

  const form = new FormData();
  form.append("file", file, file.name);

  const res = await fetch(`${API_BASE}/split-pdf/split?${params.toString()}`, {
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

  return (await res.json()) as SplitPdfResult;
}
