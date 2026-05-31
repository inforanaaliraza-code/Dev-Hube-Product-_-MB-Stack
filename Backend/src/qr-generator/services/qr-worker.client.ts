import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { generateQrPngFallback } from '../utils/qr-fallback.util';

type GenerateParams = {
  data: string;
  foreground: string;
  background: string;
  sizePx: number;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  logoBase64?: string;
  logoScale?: number;
};

type GenerateResult = {
  pngBase64: string;
  width: number;
  height: number;
  usedWorker: boolean;
};

@Injectable()
export class QrWorkerClient {
  private readonly logger = new Logger(QrWorkerClient.name);
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl =
      this.config.get<string>('qrGenerator.workerUrl') ?? 'http://127.0.0.1:8101';
  }

  async generate(params: GenerateParams): Promise<GenerateResult> {
    try {
      const res = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: params.data,
          foreground: params.foreground,
          background: params.background,
          size_px: params.sizePx,
          error_correction: params.errorCorrection,
          logo_base64: params.logoBase64 ?? null,
          logo_scale: params.logoScale ?? 0.22,
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) {
        return this.fallback(params);
      }
      const data = (await res.json()) as {
        png_base64: string;
        width: number;
        height: number;
      };
      if (!data.png_base64) {
        return this.fallback(params);
      }
      return {
        pngBase64: data.png_base64,
        width: data.width ?? params.sizePx,
        height: data.height ?? params.sizePx,
        usedWorker: true,
      };
    } catch (err) {
      this.logger.warn(`QR worker unavailable: ${String(err)}`);
      return this.fallback(params);
    }
  }

  private async fallback(params: GenerateParams): Promise<GenerateResult> {
    const buffer = await generateQrPngFallback({
      data: params.data,
      foreground: params.foreground,
      background: params.background,
      sizePx: params.sizePx,
      errorCorrection: params.errorCorrection,
    });
    return {
      pngBase64: buffer.toString('base64'),
      width: params.sizePx,
      height: params.sizePx,
      usedWorker: false,
    };
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
