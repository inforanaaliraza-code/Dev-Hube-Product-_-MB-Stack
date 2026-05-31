import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { stripHtmlFallback } from '../utils/html-sanitize-fallback.util';
import { extractOtpFallback } from '../utils/otp-fallback.util';

type OtpParseResult = {
  codes: string[];
  primary: string | null;
};

@Injectable()
export class MailWorkerClient {
  private readonly logger = new Logger(MailWorkerClient.name);
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>('tempMail.workerUrl') ?? 'http://127.0.0.1:8100';
  }

  private otpFallback(subject: string, text: string, html: string): OtpParseResult {
    const codes = extractOtpFallback(subject, text, html);
    return { codes, primary: codes[0] ?? null };
  }

  async parseOtp(subject: string, text: string, html: string): Promise<OtpParseResult> {
    try {
      const res = await fetch(`${this.baseUrl}/parse/otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, text, html }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) {
        return this.otpFallback(subject, text, html);
      }
      const data = (await res.json()) as OtpParseResult;
      if (!data.codes?.length) {
        return this.otpFallback(subject, text, html);
      }
      return data;
    } catch (err) {
      this.logger.warn(`OTP worker unavailable: ${String(err)}`);
      return this.otpFallback(subject, text, html);
    }
  }

  async sanitizeHtml(html: string): Promise<string> {
    if (!html.trim()) {
      return '';
    }
    try {
      const res = await fetch(`${this.baseUrl}/sanitize/html`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) {
        return stripHtmlFallback(html);
      }
      const data = (await res.json()) as { html: string };
      const cleaned = data.html?.trim() ?? '';
      return cleaned || stripHtmlFallback(html);
    } catch (err) {
      this.logger.warn(`HTML worker unavailable: ${String(err)}`);
      return stripHtmlFallback(html);
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/health`, {
        signal: AbortSignal.timeout(8000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
