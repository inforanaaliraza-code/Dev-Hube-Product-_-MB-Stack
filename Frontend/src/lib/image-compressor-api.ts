import { ApiError } from "@/lib/api";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api/v1";

export type OutputFormat = "auto" | "jpeg" | "png" | "webp";

export type CompressImageOptions = {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  outputFormat?: OutputFormat;
  stripMetadata?: boolean;
};

export type CompressImageResult = {
  mimeType: string;
  fileBase64: string;
  originalBytes: number;
  compressedBytes: number;
  savingsPercent: number;
  width: number;
  height: number;
  outputFormat: string;
  originalName: string;
  workerAvailable: boolean;
};

export function getWorkerHealth() {
  return fetch(`${API_BASE}/image-compressor/health`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  }).then(async (res) => {
    if (!res.ok) {
      throw new ApiError("Health check failed", res.status);
    }
    return (await res.json()) as { ok: boolean };
  });
}

export async function compressImageFile(
  file: File,
  options: CompressImageOptions = {},
): Promise<CompressImageResult> {
  const params = new URLSearchParams();
  if (options.quality != null) {
    params.set("quality", String(options.quality));
  }
  if (options.maxWidth != null) {
    params.set("maxWidth", String(options.maxWidth));
  }
  if (options.maxHeight != null) {
    params.set("maxHeight", String(options.maxHeight));
  }
  if (options.outputFormat) {
    params.set("outputFormat", options.outputFormat);
  }
  if (options.stripMetadata != null) {
    params.set("stripMetadata", String(options.stripMetadata));
  }

  const form = new FormData();
  form.append("file", file, file.name);

  const qs = params.toString();
  const url = `${API_BASE}/image-compressor/compress${qs ? `?${qs}` : ""}`;
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

  return (await res.json()) as CompressImageResult;
}
