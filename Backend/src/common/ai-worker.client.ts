import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiWorkerClient {
  private readonly logger = new Logger(AiWorkerClient.name);
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl =
      this.config.get<string>('aiAssistant.workerUrl') ?? 'http://127.0.0.1:8107';
  }

  async generateCode(prompt: string, language: string) {
    const res = await fetch(`${this.baseUrl}/generate/code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ prompt, language }),
      signal: AbortSignal.timeout(120000),
    });
    return this.parseJson<{ code: string; language: string }>(res);
  }

  async paraphrase(text: string, tone: string) {
    const res = await fetch(`${this.baseUrl}/rewrite/paraphrase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ text, tone }),
      signal: AbortSignal.timeout(300000),
    });
    return this.parseJson<{ result: string }>(res);
  }

  async humanize(text: string, tone: string) {
    const res = await fetch(`${this.baseUrl}/rewrite/humanize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ text, tone }),
      signal: AbortSignal.timeout(300000),
    });
    return this.parseJson<{ result: string }>(res);
  }

  async generateResume(payload: {
    fullName: string;
    jobTitle: string;
    summary: string;
    experience: string;
    skills: string;
    education: string;
  }) {
    const res = await fetch(`${this.baseUrl}/generate/resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        full_name: payload.fullName,
        job_title: payload.jobTitle,
        summary: payload.summary,
        experience: payload.experience,
        skills: payload.skills,
        education: payload.education,
      }),
      signal: AbortSignal.timeout(120000),
    });
    return this.parseJson<{ resume_markdown: string }>(res);
  }

  async isHealthy(): Promise<{
    ok: boolean;
    configured: boolean;
    provider?: string;
    model_state?: string;
  }> {
    try {
      const res = await fetch(`${this.baseUrl}/health`, {
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) {
        return { ok: false, configured: false };
      }
      const data = (await res.json()) as {
        service?: string;
        configured?: boolean;
        provider?: string;
        model_state?: string;
      };
      return {
        ok: data.service === 'ai-assistant',
        configured: Boolean(data.configured),
        provider: data.provider,
        model_state: data.model_state,
      };
    } catch {
      return { ok: false, configured: false };
    }
  }

  private async parseJson<T>(res: Response): Promise<T> {
    if (!res.ok) {
      let detail = `Worker failed (${res.status})`;
      if (res.status === 404) {
        throw new Error(
          'Wrong Python app on AI port. Run Services/ai-assistant on port 8107.',
        );
      }
      try {
        const body = (await res.json()) as { detail?: string };
        if (body.detail) {
          detail = body.detail;
        }
      } catch {
      }
      throw new Error(detail);
    }
    return (await res.json()) as T;
  }
}
