import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type CompressWorkerResult = {
  mimeType: string;
  fileBase64: string;
  originalBytes: number;
  compressedBytes: number;
  savingsPercent: number;
  width: number;
  height: number;
  outputFormat: string;
  usedWorker: boolean;
};

type CompressParams = {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  quality: number;
  maxWidth?: number;
  maxHeight?: number;
  outputFormat: string;
  stripMetadata: boolean;
};

@Injectable()
export class ImageWorkerClient {
  private readonly logger = new Logger(ImageWorkerClient.name);
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl =
      this.config.get<string>('imageCompressor.workerUrl') ??
      'http://127.0.0.1:8102';
  }

  async compress(params: CompressParams): Promise<CompressWorkerResult> {
    const form = new FormData();
    const blob = new Blob([new Uint8Array(params.buffer)], {
      type: params.mimeType,
    });
    form.append('file', blob, params.filename);
    form.append('quality', String(params.quality));
    if (params.maxWidth) {
      form.append('max_width', String(params.maxWidth));
    }
    if (params.maxHeight) {
      form.append('max_height', String(params.maxHeight));
    }
    form.append('output_format', params.outputFormat);
    form.append('strip_metadata', String(params.stripMetadata));

    try {
      const res = await fetch(`${this.baseUrl}/compress`, {
        method: 'POST',
        body: form,
        signal: AbortSignal.timeout(120000),
      });
      if (!res.ok) {
        const detail = await res.text();
        if (res.status === 404) {
          throw new Error(
            'Wrong Python app on IMAGE_COMPRESSOR port. Stop it and run Services/image-compressor on port 8102.',
          );
        }
        throw new Error(detail || `Worker failed (${res.status})`);
      }
      const data = (await res.json()) as {
        mime_type: string;
        file_base64: string;
        original_bytes: number;
        compressed_bytes: number;
        savings_percent: number;
        width: number;
        height: number;
        output_format: string;
      };
      return {
        mimeType: data.mime_type,
        fileBase64: data.file_base64,
        originalBytes: data.original_bytes,
        compressedBytes: data.compressed_bytes,
        savingsPercent: data.savings_percent,
        width: data.width,
        height: data.height,
        outputFormat: data.output_format,
        usedWorker: true,
      };
    } catch (err) {
      this.logger.warn(`Image worker unavailable: ${String(err)}`);
      throw err;
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/health`, {
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) {
        return false;
      }
      const data = (await res.json()) as { service?: string };
      return data.service === 'image-compressor';
    } catch {
      return false;
    }
  }
}
