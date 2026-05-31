import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SpeechToTextWorkerClient {
  private readonly logger = new Logger(SpeechToTextWorkerClient.name);
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl =
      this.config.get<string>('speechToText.workerUrl') ?? 'http://127.0.0.1:8109';
  }

  async transcribe(buffer: Buffer, filename: string) {
    const form = new FormData();
    const blob = new Blob([new Uint8Array(buffer)], { type: 'application/octet-stream' });
    form.append('file', blob, filename);
    try {
      const res = await fetch(`${this.baseUrl}/transcribe`, {
        method: 'POST',
        body: form,
        signal: AbortSignal.timeout(300000),
      });
      if (!res.ok) {
        let detail = `Worker failed (${res.status})`;
        if (res.status === 404) {
          throw new Error('Wrong app on port 8109. Run Services/speech-to-text.');
        }
        try {
          const body = (await res.json()) as { detail?: string };
          if (body.detail) detail = body.detail;
        } catch {}
        throw new Error(detail);
      }
      const data = (await res.json()) as {
        text: string;
        segments: Array<{ start: number; end: number; text: string }>;
        duration_seconds: number;
        language: string;
      };
      return {
        text: data.text,
        segments: data.segments,
        durationSeconds: data.duration_seconds,
        language: data.language,
      };
    } catch (err) {
      this.logger.warn(`Speech to text worker unavailable: ${String(err)}`);
      throw err;
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/health`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) return false;
      const data = (await res.json()) as { service?: string };
      return data.service === 'speech-to-text';
    } catch {
      return false;
    }
  }
}
