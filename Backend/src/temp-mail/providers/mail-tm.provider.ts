import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type MailTmDomain = {
  id: string;
  domain: string;
  isActive: boolean;
  isPrivate: boolean;
};

type MailTmAccount = {
  id: string;
  address: string;
};

type MailTmToken = {
  token: string;
  id: string;
};

type MailTmMessageListItem = {
  id: string;
  from: { address: string; name?: string };
  subject: string;
  intro: string;
  createdAt: string;
  hasAttachments: boolean;
};

type MailTmMessageDetail = MailTmMessageListItem & {
  text: string;
  html: string[];
};

type MailTmErrorPayload = {
  detail?: string;
  message?: string;
  violations?: { propertyPath?: string; message?: string }[];
};

@Injectable()
export class MailTmProvider {
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>('tempMail.providerBaseUrl') ?? 'https://api.mail.tm';
  }

  async listDomains(): Promise<string[]> {
    const res = await this.request<{ 'hydra:member': MailTmDomain[] }>('/domains');
    return res['hydra:member']
      .filter((d) => d.isActive && !d.isPrivate)
      .map((d) => d.domain);
  }

  async createAccount(address: string, password: string): Promise<MailTmAccount> {
    return this.request<MailTmAccount>('/accounts', {
      method: 'POST',
      body: JSON.stringify({ address, password }),
    });
  }

  async deleteAccount(accountId: string, token: string): Promise<void> {
    await this.request<void>(`/accounts/${accountId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async createToken(address: string, password: string): Promise<MailTmToken> {
    return this.request<MailTmToken>('/token', {
      method: 'POST',
      body: JSON.stringify({ address, password }),
    });
  }

  async listMessages(token: string): Promise<MailTmMessageListItem[]> {
    const res = await this.request<{ 'hydra:member': MailTmMessageListItem[] }>('/messages', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res['hydra:member'] ?? [];
  }

  async getMessage(token: string, messageId: string): Promise<MailTmMessageDetail> {
    return this.request<MailTmMessageDetail>(`/messages/${messageId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      Accept: 'application/ld+json',
      'User-Agent': 'DevHube-TempMail/1.0',
      ...(init.headers as Record<string, string> | undefined),
    };
    if (init.body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    let response: Response;
    try {
      response = await fetch(url, { ...init, headers });
    } catch {
      throw new ServiceUnavailableException('Temp mail provider is unreachable');
    }
    if (response.status === 204) {
      return undefined as T;
    }
    const payload = (await response.json().catch(() => null)) as T | MailTmErrorPayload | null;
    if (!response.ok) {
      let detail = `Provider error (${response.status})`;
      const errorPayload =
        payload && typeof payload === 'object' ? (payload as MailTmErrorPayload) : null;
      if (errorPayload?.detail) {
        detail = String(errorPayload.detail);
      } else if (errorPayload?.message) {
        detail = String(errorPayload.message);
      } else if (errorPayload?.violations && errorPayload.violations.length > 0) {
        detail = errorPayload.violations
          .map((v: { propertyPath?: string; message?: string }) => v.message || v.propertyPath)
          .filter(Boolean)
          .join(', ');
      }
      if (response.status >= 500) {
        throw new ServiceUnavailableException(detail);
      }
      throw new BadGatewayException(detail);
    }
    return payload as T;
  }
}
