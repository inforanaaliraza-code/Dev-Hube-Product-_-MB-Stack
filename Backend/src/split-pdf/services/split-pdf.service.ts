import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadedMemoryFile } from '../../common/uploaded-file.type';
import { SplitPdfQueryDto } from '../dto/split-pdf.dto';
import {
  SplitEachWorkerResult,
  SplitPdfWorkerClient,
  SplitPdfWorkerError,
  SplitRangeWorkerResult,
} from './split-pdf-worker.client';

export type SplitPdfRangeResponse = SplitRangeWorkerResult & {
  originalName: string;
  originalBytes: number;
  workerAvailable: boolean;
};

export type SplitPdfEachResponse = SplitEachWorkerResult & {
  originalName: string;
  originalBytes: number;
  workerAvailable: boolean;
};

export type SplitPdfResponse = SplitPdfRangeResponse | SplitPdfEachResponse;

@Injectable()
export class SplitPdfService {
  private readonly maxBytes: number;

  constructor(
    private readonly config: ConfigService,
    private readonly worker: SplitPdfWorkerClient,
  ) {
    this.maxBytes =
      this.config.get<number>('splitPdf.maxBytes') ?? 25 * 1024 * 1024;
  }

  async workerHealth() {
    const ok = await this.worker.isHealthy();
    return { ok };
  }

  async inspect(file: UploadedMemoryFile | undefined) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('PDF file is required');
    }
    if (file.size > this.maxBytes) {
      throw new BadRequestException('File exceeds 25 MB limit');
    }
    try {
      const pageCount = await this.worker.inspect(
        file.buffer,
        file.originalname || 'document.pdf',
      );
      return { pageCount, workerAvailable: await this.worker.isHealthy() };
    } catch (err) {
      if (err instanceof SplitPdfWorkerError && err.status < 500) {
        throw new BadRequestException(err.message);
      }
      const message = err instanceof Error ? err.message : 'Inspect failed';
      throw new ServiceUnavailableException(
        `Split PDF worker unavailable. Start Services/split-pdf on port 8105. ${message}`,
      );
    }
  }

  async split(
    file: UploadedMemoryFile | undefined,
    query: SplitPdfQueryDto,
  ): Promise<SplitPdfResponse> {
    if (!file?.buffer?.length) {
      throw new BadRequestException('PDF file is required');
    }
    if (file.size > this.maxBytes) {
      throw new BadRequestException('File exceeds 25 MB limit');
    }

    const mime = file.mimetype?.toLowerCase() ?? '';
    const name = (file.originalname || '').toLowerCase();
    if (mime !== 'application/pdf' && !name.endsWith('.pdf')) {
      throw new BadRequestException('Only PDF files are supported');
    }

    const mode = query.mode ?? 'range';

    if (mode === 'range') {
      if (query.startPage == null) {
        throw new BadRequestException('startPage is required for range mode');
      }
      if (
        query.endPage != null &&
        query.endPage < query.startPage
      ) {
        throw new BadRequestException(
          'End page must be greater than or equal to start page',
        );
      }
    }

    try {
      const result = await this.worker.split({
        buffer: file.buffer,
        filename: file.originalname || 'document.pdf',
        mode,
        startPage: query.startPage,
        endPage: query.endPage,
      });
      const workerOk = await this.worker.isHealthy();
      const base = {
        originalName: file.originalname || 'document.pdf',
        originalBytes: file.size,
        workerAvailable: workerOk,
      };

      if (result.mode === 'each') {
        return { ...result, ...base };
      }

      return { ...result, ...base };
    } catch (err) {
      if (err instanceof SplitPdfWorkerError && err.status < 500) {
        throw new BadRequestException(err.message);
      }
      const message = err instanceof Error ? err.message : 'Split failed';
      throw new ServiceUnavailableException(
        `Split PDF worker unavailable. Start Services/split-pdf on port 8105. ${message}`,
      );
    }
  }
}
