import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadedMemoryFile } from '../../common/uploaded-file.type';
import { MergePdfWorkerClient } from './merge-pdf-worker.client';

export type MergePdfResponse = {
  pdfBase64: string;
  filename: string;
  fileCount: number;
  totalPages: number;
  totalBytes: number;
  inputBytes: number;
  sources: Array<{ name: string; pages: number }>;
  workerAvailable: boolean;
};

@Injectable()
export class MergePdfService {
  private readonly maxFileBytes: number;
  private readonly maxFiles: number;
  private readonly maxTotalBytes: number;

  constructor(
    private readonly config: ConfigService,
    private readonly worker: MergePdfWorkerClient,
  ) {
    this.maxFileBytes =
      this.config.get<number>('mergePdf.maxFileBytes') ?? 25 * 1024 * 1024;
    this.maxFiles = this.config.get<number>('mergePdf.maxFiles') ?? 20;
    this.maxTotalBytes =
      this.config.get<number>('mergePdf.maxTotalBytes') ?? 100 * 1024 * 1024;
  }

  async workerHealth() {
    const ok = await this.worker.isHealthy();
    return { ok };
  }

  async merge(files: UploadedMemoryFile[] | undefined): Promise<MergePdfResponse> {
    if (!files?.length) {
      throw new BadRequestException('At least one PDF file is required');
    }
    if (files.length < 2) {
      throw new BadRequestException('Upload at least two PDF files to merge');
    }
    if (files.length > this.maxFiles) {
      throw new BadRequestException(`Maximum ${this.maxFiles} files allowed`);
    }

    let inputBytes = 0;
    for (const file of files) {
      if (!file.buffer?.length) {
        throw new BadRequestException('One or more files are empty');
      }
      const mime = file.mimetype?.toLowerCase() ?? '';
      const name = (file.originalname || '').toLowerCase();
      if (mime !== 'application/pdf' && !name.endsWith('.pdf')) {
        throw new BadRequestException(
          `Only PDF files are supported: ${file.originalname || 'unknown'}`,
        );
      }
      if (file.size > this.maxFileBytes) {
        throw new BadRequestException(
          `File exceeds 25 MB: ${file.originalname || 'unknown'}`,
        );
      }
      inputBytes += file.size;
    }

    if (inputBytes > this.maxTotalBytes) {
      throw new BadRequestException('Total upload exceeds 100 MB');
    }

    try {
      const result = await this.worker.merge(files);
      const workerOk = await this.worker.isHealthy();
      return {
        pdfBase64: result.pdfBase64,
        filename: result.filename,
        fileCount: result.fileCount,
        totalPages: result.totalPages,
        totalBytes: result.totalBytes,
        inputBytes,
        sources: result.sources,
        workerAvailable: workerOk,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Merge failed';
      throw new ServiceUnavailableException(
        `Merge PDF worker unavailable. Start Services/merge-pdf on port 8104. ${message}`,
      );
    }
  }
}
