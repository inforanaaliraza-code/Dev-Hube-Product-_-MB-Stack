import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ImageConverterWorkerClient {
  private readonly logger = new Logger(ImageConverterWorkerClient.name);
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl =
      this.config.get<string>('imageConverter.workerUrl') ?? 'http://127.0.0.1:8110';
  }

  async convert(buffer: Buffer, filename: string, format: string) {
    const form = new FormData();
    const blob = new Blob([new Uint8Array(buffer)], { type: 'application/octet-stream' });
    form.append('file', blob, filename);
    form.append('format', format);
    const res = await fetch(`${this.baseUrl}/convert`, {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(120000),
    });
    if (!res.ok) {
      let detail = `Worker failed (${res.status})`;
      try {
        const body = (await res.json()) as { detail?: string };
        if (body.detail) detail = body.detail;
      } catch {}
      throw new Error(detail);
    }
    const data = (await res.json()) as {
      image_base64: string;
      format: string;
      bytes: number;
    };
    return {
      imageBase64: data.image_base64,
      format: data.format,
      bytes: data.bytes,
    };
  }

  async isHealthy() {
    try {
      const res = await fetch(`${this.baseUrl}/health`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) return false;
      const data = (await res.json()) as { service?: string };
      return data.service === 'image-converter';
    } catch {
      return false;
    }
  }
}
