import { apiFetch } from "@/lib/api";

export type QrCodeMode = "static" | "dynamic";
export type QrContentType = "url" | "text";
export type QrErrorLevel = "L" | "M" | "Q" | "H";

export type QrCodeRecord = {
  id: string;
  mode: QrCodeMode;
  contentType: QrContentType;
  payload: string;
  encodedData: string;
  shortCode: string | null;
  redirectUrl: string | null;
  foregroundColor: string;
  backgroundColor: string;
  errorCorrection: string;
  sizePx: number;
  hasLogo: boolean;
  scanCount: number;
  trackScans: boolean;
  createdAt: string;
  updatedAt: string;
  imagePngBase64?: string;
  workerAvailable?: boolean;
};

export type QrAnalytics = {
  totalScans: number;
  scans: Array<{
    id: string;
    scannedAt: string;
    userAgent: string | null;
    referer: string | null;
  }>;
};

export type CreateQrCodeInput = {
  mode: QrCodeMode;
  contentType: QrContentType;
  payload: string;
  trackScans?: boolean;
  foregroundColor?: string;
  backgroundColor?: string;
  errorCorrection?: QrErrorLevel;
  sizePx?: number;
  logoBase64?: string;
  logoScale?: number;
};

const STORAGE_KEY = "devhube.qrGenerator.lastId";

export function getStoredQrId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function setStoredQrId(id: string | null) {
  if (typeof window === "undefined") return;
  if (!id) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, id);
}

export function getWorkerHealth() {
  return apiFetch<{ ok: boolean }>("/qr-generator/health");
}

export function createQrCode(input: CreateQrCodeInput) {
  return apiFetch<QrCodeRecord>("/qr-generator/codes", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchQrCode(id: string) {
  return apiFetch<QrCodeRecord>(`/qr-generator/codes/${id}`);
}

export function regenerateQrImage(id: string) {
  return apiFetch<QrCodeRecord>(`/qr-generator/codes/${id}/image`);
}

export function updateQrCode(id: string, payload: string) {
  return apiFetch<QrCodeRecord>(`/qr-generator/codes/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ payload }),
  });
}

export function deleteQrCode(id: string) {
  return apiFetch<void>(`/qr-generator/codes/${id}`, { method: "DELETE" });
}

export function fetchQrAnalytics(id: string) {
  return apiFetch<QrAnalytics>(`/qr-generator/codes/${id}/analytics`);
}
