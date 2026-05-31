import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadedMemoryFile } from '../../common/uploaded-file.type';
import { CompressPdfWorkerClient } from './compress-pdf-worker.client';

@Injectable()
export class CompressPdfService {
  private readonly maxBytes: number;

  constructor(
    private readonly config: ConfigService,
    private readonly worker: CompressPdfWorkerClient,
  ) {
    this.maxBytes =
      this.config.get<number>('compressPdf.maxBytes') ?? 25 * 1024 * 1024;
  }

  async workerHealth() {
    const ok = await this.worker.isHealthy();
    return { ok };
  }

  async compress(file: UploadedMemoryFile | undefined, level: string) {
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
    const compressLevel = (level || 'medium').toLowerCase();
    if (!['low', 'medium', 'high'].includes(compressLevel)) {
      throw new BadRequestException('level must be low, medium, or high');
    }

    try {
      const result = await this.worker.compress(
        file.buffer,
        file.originalname || 'document.pdf',
        compressLevel,
      );
      const workerOk = await this.worker.isHealthy();
      return {
        ...result,
        originalName: file.originalname || 'document.pdf',
        workerAvailable: workerOk,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Compression failed';
      throw new ServiceUnavailableException(
        `Compress PDF worker unavailable. Start Services/compress-pdf on port 8106. ${message}`,
      );
    }
  }
}
