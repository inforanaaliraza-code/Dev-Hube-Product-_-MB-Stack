import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type SplitRangeWorkerResult = {
  mode: 'range';
  pdfBase64: string;
  filename: string;
  pageCount: number;
  splitPages: number;
  startPage: number;
  endPage: number;
  outputBytes: number;
};

export type SplitEachWorkerResult = {
  mode: 'each';
  zipBase64: string;
  filename: string;
  pageCount: number;
  fileCount: number;
  outputBytes: number;
};

export type SplitWorkerResult = SplitRangeWorkerResult | SplitEachWorkerResult;

export class SplitPdfWorkerError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'SplitPdfWorkerError';
  }
}

type SplitParams = {
  buffer: Buffer;
  filename: string;
  mode: 'range' | 'each';
  startPage?: number;
  endPage?: number;
};

@Injectable()
export class SplitPdfWorkerClient {
  private readonly logger = new Logger(SplitPdfWorkerClient.name);
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl =
      this.config.get<string>('splitPdf.workerUrl') ?? 'http://127.0.0.1:8105';
  }

  async split(params: SplitParams): Promise<SplitWorkerResult> {
    const form = new FormData();
    const blob = new Blob([new Uint8Array(params.buffer)], {
      type: 'application/pdf',
    });
    form.append('file', blob, params.filename);
    form.append('mode', params.mode);
    if (params.startPage != null) {
      form.append('start_page', String(params.startPage));
    }
    if (params.endPage != null) {
      form.append('end_page', String(params.endPage));
    }

    try {
      const res = await fetch(`${this.baseUrl}/split`, {
        method: 'POST',
        body: form,
        signal: AbortSignal.timeout(300000),
      });
      if (!res.ok) {
        let detail = `Worker failed (${res.status})`;
        if (res.status === 404) {
          throw new Error(
            'Wrong Python app on SPLIT_PDF port. Run Services/split-pdf on port 8105.',
          );
        }
        try {
          const body = (await res.json()) as { detail?: string };
          if (body.detail) {
            detail = body.detail;
          }
        } catch {
        }
        throw new SplitPdfWorkerError(detail, res.status);
      }
      const data = (await res.json()) as {
        mode: 'range' | 'each';
        pdf_base64?: string;
        zip_base64?: string;
        filename: string;
        page_count: number;
        split_pages?: number;
        start_page?: number;
        end_page?: number;
        file_count?: number;
        output_bytes: number;
      };

      if (data.mode === 'each') {
        return {
          mode: 'each',
          zipBase64: data.zip_base64 ?? '',
          filename: data.filename,
          pageCount: data.page_count,
          fileCount: data.file_count ?? data.page_count,
          outputBytes: data.output_bytes,
        };
      }

      return {
        mode: 'range',
        pdfBase64: data.pdf_base64 ?? '',
        filename: data.filename,
        pageCount: data.page_count,
        splitPages: data.split_pages ?? 0,
        startPage: data.start_page ?? 1,
        endPage: data.end_page ?? 1,
        outputBytes: data.output_bytes,
      };
    } catch (err) {
      if (!(err instanceof SplitPdfWorkerError)) {
        this.logger.warn(`Split PDF worker unavailable: ${String(err)}`);
      }
      throw err;
    }
  }

  async inspect(buffer: Buffer, filename: string): Promise<number> {
    const form = new FormData();
    const blob = new Blob([new Uint8Array(buffer)], {
      type: 'application/pdf',
    });
    form.append('file', blob, filename);
    const res = await fetch(`${this.baseUrl}/inspect`, {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(60000),
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
      throw new SplitPdfWorkerError(detail, res.status);
    }
    const data = (await res.json()) as { page_count: number };
    return data.page_count;
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
      return data.service === 'split-pdf';
    } catch {
      return false;
    }
  }
}
