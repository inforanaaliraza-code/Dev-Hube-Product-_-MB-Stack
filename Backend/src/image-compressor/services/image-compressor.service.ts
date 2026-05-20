import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadedMemoryFile } from '../../common/uploaded-file.type';
import { CompressImageQueryDto } from '../dto/compress-image.dto';
import { ImageWorkerClient } from './image-worker.client';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

export type CompressImageResponse = {
  mimeType: string;
  fileBase64: string;
  originalBytes: number;
  compressedBytes: number;
  savingsPercent: number;
  width: number;
  height: number;
  outputFormat: string;
  originalName: string;
  workerAvailable: boolean;
};

@Injectable()
export class ImageCompressorService {
  private readonly maxBytes: number;

  constructor(
    private readonly config: ConfigService,
    private readonly worker: ImageWorkerClient,
  ) {
    this.maxBytes =
      this.config.get<number>('imageCompressor.maxBytes') ?? 15 * 1024 * 1024;
  }

  async workerHealth() {
    const ok = await this.worker.isHealthy();
    return { ok };
  }

  async compress(
    file: UploadedMemoryFile | undefined,
    query: CompressImageQueryDto,
  ): Promise<CompressImageResponse> {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Image file is required');
    }
    if (file.size > this.maxBytes) {
      throw new BadRequestException('File exceeds 15 MB limit');
    }
    const mimeType = file.mimetype?.toLowerCase() ?? '';
    if (!ALLOWED_MIME.has(mimeType)) {
      throw new BadRequestException('Only PNG, JPG and WebP are supported');
    }

    const quality = query.quality ?? 82;
    const outputFormat = query.outputFormat ?? 'auto';
    const stripMetadata = query.stripMetadata ?? true;

    try {
      const result = await this.worker.compress({
        buffer: file.buffer,
        filename: file.originalname || 'image',
        mimeType,
        quality,
        maxWidth: query.maxWidth,
        maxHeight: query.maxHeight,
        outputFormat,
        stripMetadata,
      });
      const workerOk = await this.worker.isHealthy();
      return {
        mimeType: result.mimeType,
        fileBase64: result.fileBase64,
        originalBytes: result.originalBytes,
        compressedBytes: result.compressedBytes,
        savingsPercent: result.savingsPercent,
        width: result.width,
        height: result.height,
        outputFormat: result.outputFormat,
        originalName: file.originalname || 'image',
        workerAvailable: workerOk,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Compression failed';
      throw new ServiceUnavailableException(
        `Image worker unavailable. Start Services/image-compressor on port 8102. ${message}`,
      );
    }
  }
}
