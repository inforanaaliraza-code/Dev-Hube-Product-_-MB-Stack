import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type ConvertWorkerResult = {
  docxBase64: string;
  originalBytes: number;
  docxBytes: number;
  pageCount: number;
  convertedPages: number;
  filename: string;
};

type ConvertParams = {
  buffer: Buffer;
  filename: string;
  startPage?: number;
  endPage?: number;
};

@Injectable()
export class PdfWorkerClient {
  private readonly logger = new Logger(PdfWorkerClient.name);
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl =
      this.config.get<string>('pdfToWord.workerUrl') ?? 'http://127.0.0.1:8103';
  }

  async convert(params: ConvertParams): Promise<ConvertWorkerResult> {
    const form = new FormData();
    const blob = new Blob([new Uint8Array(params.buffer)], {
      type: 'application/pdf',
    });
    form.append('file', blob, params.filename);
    if (params.startPage != null) {
      form.append('start_page', String(params.startPage));
    }
    if (params.endPage != null) {
      form.append('end_page', String(params.endPage));
    }

    try {
      const res = await fetch(`${this.baseUrl}/convert`, {
        method: 'POST',
        body: form,
        signal: AbortSignal.timeout(300000),
      });
      if (!res.ok) {
        let detail = `Worker failed (${res.status})`;
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
        docx_base64: string;
        original_bytes: number;
        docx_bytes: number;
        page_count: number;
        converted_pages: number;
        filename: string;
      };
      return {
        docxBase64: data.docx_base64,
        originalBytes: data.original_bytes,
        docxBytes: data.docx_bytes,
        pageCount: data.page_count,
        convertedPages: data.converted_pages,
        filename: data.filename,
      };
    } catch (err) {
      this.logger.warn(`PDF worker unavailable: ${String(err)}`);
      throw err;
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
