import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type CompressWorkerResult = {
  pdfBase64: string;
  filename: string;
  originalBytes: number;
  compressedBytes: number;
  savedBytes: number;
  savedPercent: number;
  level: string;
};

@Injectable()
export class CompressPdfWorkerClient {
  private readonly logger = new Logger(CompressPdfWorkerClient.name);
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl =
      this.config.get<string>('compressPdf.workerUrl') ?? 'http://127.0.0.1:8106';
  }

  async compress(buffer: Buffer, filename: string, level: string): Promise<CompressWorkerResult> {
    const form = new FormData();
    const blob = new Blob([new Uint8Array(buffer)], { type: 'application/pdf' });
    form.append('file', blob, filename);
    form.append('level', level);

    try {
      const res = await fetch(`${this.baseUrl}/compress`, {
        method: 'POST',
        body: form,
        signal: AbortSignal.timeout(300000),
      });
      if (!res.ok) {
        let detail = `Worker failed (${res.status})`;
        if (res.status === 404) {
          throw new Error(
            'Wrong Python app on COMPRESS_PDF port. Run Services/compress-pdf on port 8106.',
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
      const data = (await res.json()) as {
        pdf_base64: string;
        filename: string;
        original_bytes: number;
        compressed_bytes: number;
        saved_bytes: number;
        saved_percent: number;
        level: string;
      };
      return {
        pdfBase64: data.pdf_base64,
        filename: data.filename,
        originalBytes: data.original_bytes,
        compressedBytes: data.compressed_bytes,
        savedBytes: data.saved_bytes,
        savedPercent: data.saved_percent,
        level: data.level,
      };
    } catch (err) {
      this.logger.warn(`Compress PDF worker unavailable: ${String(err)}`);
      throw err;
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/health`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) {
        return false;
      }
      const data = (await res.json()) as { service?: string };
      return data.service === 'compress-pdf';
    } catch {
      return false;
    }
  }
}
