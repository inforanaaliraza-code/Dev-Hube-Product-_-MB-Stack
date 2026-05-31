import { ApiError } from "@/lib/api";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api/v1";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = (await res.json()) as { message?: string | string[] };
      if (data.message) message = Array.isArray(data.message) ? data.message.join(", ") : data.message;
    } catch {}
    throw new ApiError(message, res.status);
  }
  return (await res.json()) as T;
}

export const devtoolsApi = {
  metaTags: (body: { title: string; description: string; url?: string; image?: string; siteName?: string }) =>
    post<{ html: string }>("/meta-tags-generator/generate", body),
  robotsTxt: (body: { rules: Array<{ agent: string; allow: string[]; disallow: string[] }>; sitemap?: string }) =>
    post<{ content: string }>("/robots-txt/generate", body),
  sitemap: (urls: string) => post<{ xml: string; count: number }>("/sitemap-generator/generate", { urls }),
  jsonValidate: (json: string) => post<{ valid: boolean; formatted: string | null; error: string | null }>("/json-validator/validate", { json }),
  jsonFormat: (json: string, minify?: boolean) => post<{ output: string }>("/json-formatter/format", { json, minify }),
  cssMinify: (css: string) => post<{ output: string; savedBytes: number }>("/css-minifier/minify", { css }),
  jsBeautify: (code: string) => post<{ output: string }>("/js-beautifier/beautify", { code }),
  htmlToMarkdown: (html: string) => post<{ markdown: string }>("/html-to-markdown/convert", { html }),
  regexTest: (pattern: string, text: string, flags?: string) =>
    post<{ matches: Array<{ match: string; index: number }>; count: number }>("/regex-tester/test", { pattern, text, flags }),
  csvToJson: (csv: string, delimiter?: string) => post<{ json: string }>("/csv-to-json/to-json", { csv, delimiter }),
  jsonToCsv: (json: string) => post<{ csv: string }>("/csv-to-json/to-csv", { json }),
  base64: (text: string, mode: "encode" | "decode") => post<{ output: string }>("/base64/convert", { text, mode }),
  jwtDecode: (token: string) => post<Record<string, unknown>>("/jwt-decoder/decode", { token }),
  urlEncode: (text: string, mode: "encode" | "decode") => post<{ output: string }>("/url-encoder/convert", { text, mode }),
  uuidGenerate: (version?: string, count?: number) => post<{ uuids: string[] }>("/uuid-generator/generate", { version, count }),
  apiTest: (body: {
    url: string;
    method: string;
    headers?: Array<{ key: string; value: string; enabled?: boolean }>;
    queryParams?: Array<{ key: string; value: string; enabled?: boolean }>;
    auth?: {
      type: string;
      token?: string;
      username?: string;
      password?: string;
      key?: string;
      value?: string;
      addTo?: string;
    };
    bodyType?: string;
    body?: string;
    formData?: Array<{ key: string; value: string; enabled?: boolean }>;
    timeoutMs?: number;
  }) => post<import("@/lib/api-tester-types").ApiTestResponse>("/api-tester/send", body),
  otpDetect: (body: { subject?: string; text?: string; html?: string }) =>
    post<{ codes: string[]; primary: string | null }>("/otp-detector/detect", body),
  codeReader: (body: { subject?: string; text?: string; html?: string }) =>
    post<{ codes: string[]; primary: string | null }>("/code-reader/detect", body),
  colorPicker: (hex: string) => post<Record<string, unknown>>("/color-picker/convert", { hex }),
  contrastCheck: (foreground: string, background: string) =>
    post<Record<string, unknown>>("/contrast-checker/check", { foreground, background }),
  loremIpsum: (type?: string, count?: number) => post<{ text: string }>("/lorem-ipsum/generate", { type, count }),
  caseConvert: (text: string, mode: string) => post<{ output: string }>("/case-converter/convert", { text, mode }),
  textDiff: (left: string, right: string) => post<{ parts: Array<{ value: string; added: boolean; removed: boolean }> }>("/text-diff/diff", { left, right }),
  wordCount: (text: string) => post<Record<string, number>>("/word-counter/count", { text }),
  htmlStrip: (html: string) => post<{ text: string }>("/html-stripper/strip", { html }),
  timestamp: (value: string, mode: string) => post<Record<string, unknown>>("/timestamp-converter/convert", { value, mode }),
  cronParse: (expression: string) => post<Record<string, unknown>>("/cron-parser/parse", { expression }),
  hashGenerate: (text: string) => post<{ hashes: Record<string, string> }>("/hash-generator/generate", { text }),
  unitConvert: (value: number, from: string, to: string, rootPx?: number) =>
    post<Record<string, unknown>>("/unit-converter/convert", { value, from, to, rootPx }),
  userAgentParse: (ua: string) => post<Record<string, unknown>>("/user-agent-parser/parse", { ua }),
  htmlEntities: (text: string, mode: "encode" | "decode") => post<{ output: string }>("/html-entities/convert", { text, mode }),
};

export async function convertImage(file: File, format: string) {
  const form = new FormData();
  form.append("file", file, file.name);
  const res = await fetch(`${API_BASE}/image-converter/convert?format=${encodeURIComponent(format)}`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new ApiError("Image conversion failed", res.status);
  return (await res.json()) as { imageBase64: string; format: string; mime: string };
}
