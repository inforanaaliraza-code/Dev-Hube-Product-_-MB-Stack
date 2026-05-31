import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadedMemoryFile } from '../../common/uploaded-file.type';

export type MergeWorkerResult = {
  pdfBase64: string;
  filename: string;
  fileCount: number;
  totalPages: number;
  totalBytes: number;
  sources: Array<{ name: string; pages: number }>;
};

@Injectable()
export class MergePdfWorkerClient {
  private readonly logger = new Logger(MergePdfWorkerClient.name);
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl =
      this.config.get<string>('mergePdf.workerUrl') ?? 'http://127.0.0.1:8104';
  }

  async merge(files: UploadedMemoryFile[]): Promise<MergeWorkerResult> {
    const form = new FormData();
    for (const file of files) {
      const blob = new Blob([new Uint8Array(file.buffer)], {
        type: 'application/pdf',
      });
      form.append('files', blob, file.originalname || 'document.pdf');
    }

    try {
      const res = await fetch(`${this.baseUrl}/merge`, {
        method: 'POST',
        body: form,
        signal: AbortSignal.timeout(300000),
      });
      if (!res.ok) {
        let detail = `Worker failed (${res.status})`;
        if (res.status === 404) {
          throw new Error(
            'Wrong Python app on MERGE_PDF port. Run Services/merge-pdf on port 8104.',
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
        file_count: number;
        total_pages: number;
        total_bytes: number;
        sources: Array<{ name: string; pages: number }>;
      };
      return {
        pdfBase64: data.pdf_base64,
        filename: data.filename,
        fileCount: data.file_count,
        totalPages: data.total_pages,
        totalBytes: data.total_bytes,
        sources: data.sources,
      };
    } catch (err) {
      this.logger.warn(`Merge PDF worker unavailable: ${String(err)}`);
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
      return data.service === 'merge-pdf';
    } catch {
      return false;
    }
  }
}
