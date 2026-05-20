import { apiFetch } from "@/lib/api";

export type TempMailbox = {
  id: string;
  address: string;
  expiresAt: string;
  createdAt: string;
};

export type TempMessageSummary = {
  id: string;
  from: string;
  subject: string;
  intro: string;
  receivedAt: string;
  hasAttachments: boolean;
  otpCode: string | null;
};

export type TempMessageDetail = TempMessageSummary & {
  text: string;
  html: string;
  sanitizedHtml: string;
  otpCodes: string[];
};

export type TempMailHealth = {
  ok: boolean;
};

export type TempMailDomain = {
  domain: string;
};

const STORAGE_KEY = "devhube.tempMail.mailboxId";

export function getStoredMailboxId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function setStoredMailboxId(id: string | null) {
  if (typeof window === "undefined") return;
  if (!id) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, id);
}

export function fetchDomains() {
  return apiFetch<TempMailDomain[]>("/temp-mail/domains");
}

export type CreateMailboxOptions = {
  domain?: string;
  localPart?: string;
};

export function createMailbox(options?: CreateMailboxOptions) {
  const payload: CreateMailboxOptions = {};
  if (options?.domain) {
    payload.domain = options.domain;
  }
  if (options?.localPart?.trim()) {
    payload.localPart = options.localPart.trim();
  }
  const body = Object.keys(payload).length > 0 ? JSON.stringify(payload) : undefined;
  return apiFetch<TempMailbox>("/temp-mail/mailboxes", {
    method: "POST",
    body,
  });
}

export function fetchMailbox(id: string) {
  return apiFetch<TempMailbox>(`/temp-mail/mailboxes/${id}`);
}

export function deleteMailbox(id: string) {
  return apiFetch<void>(`/temp-mail/mailboxes/${id}`, { method: "DELETE" });
}

export function listMessages(mailboxId: string) {
  return apiFetch<TempMessageSummary[]>(`/temp-mail/mailboxes/${mailboxId}/messages`);
}

export function fetchMessage(mailboxId: string, messageId: string) {
  return apiFetch<TempMessageDetail>(
    `/temp-mail/mailboxes/${mailboxId}/messages/${messageId}`,
  );
}

export function getWorkerHealth() {
  return apiFetch<TempMailHealth>("/temp-mail/health");
}
