import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ImageToTextWorkerClient {
  private readonly logger = new Logger(ImageToTextWorkerClient.name);
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl =
      this.config.get<string>('imageToText.workerUrl') ?? 'http://127.0.0.1:8108';
  }

  async extract(buffer: Buffer, filename: string) {
    const form = new FormData();
    const blob = new Blob([new Uint8Array(buffer)], { type: 'application/octet-stream' });
    form.append('file', blob, filename);
    try {
      const res = await fetch(`${this.baseUrl}/extract`, {
        method: 'POST',
        body: form,
        signal: AbortSignal.timeout(120000),
      });
      if (!res.ok) {
        let detail = `Worker failed (${res.status})`;
        if (res.status === 404) {
          throw new Error('Wrong app on port 8108. Run Services/start-all-workers.bat');
        }
        try {
          const body = (await res.json()) as { detail?: string | { msg?: string } };
          if (typeof body.detail === 'string') {
            detail = body.detail;
          } else if (body.detail && typeof body.detail === 'object' && body.detail.msg) {
            detail = body.detail.msg;
          }
        } catch {}
        throw new Error(detail);
      }
      const data = (await res.json()) as { text: string; line_count: number; char_count: number };
      return {
        text: data.text,
        lineCount: data.line_count,
        charCount: data.char_count,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('fetch failed') || message.includes('ECONNREFUSED')) {
        throw new Error(
          'Cannot reach port 8108. Restart Services/start-all-workers.bat and wait for [image-to-text] in the log.',
        );
      }
      this.logger.warn(`Image to text worker unavailable: ${message}`);
      throw err;
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/health`, { signal: AbortSignal.timeout(30000) });
      if (!res.ok) return false;
      const data = (await res.json()) as { service?: string; ocr_ready?: boolean };
      return data.service === 'image-to-text' && data.ocr_ready === true;
    } catch {
      return false;
    }
  }
}
