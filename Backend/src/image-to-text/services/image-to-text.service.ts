import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadedMemoryFile } from '../../common/uploaded-file.type';
import { ImageToTextWorkerClient } from './image-to-text-worker.client';

@Injectable()
export class ImageToTextService {
  private readonly maxBytes: number;

  constructor(
    private readonly config: ConfigService,
    private readonly worker: ImageToTextWorkerClient,
  ) {
    this.maxBytes =
      this.config.get<number>('imageToText.maxBytes') ?? 15 * 1024 * 1024;
  }

  async workerHealth() {
    return { ok: await this.worker.isHealthy() };
  }

  async extract(file: UploadedMemoryFile | undefined) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Image file is required');
    }
    if (file.size > this.maxBytes) {
      throw new BadRequestException('File exceeds 15 MB limit');
    }
    const mime = file.mimetype?.toLowerCase() ?? '';
    const name = (file.originalname || '').toLowerCase();
    const okMime = mime.startsWith('image/') || mime === 'application/octet-stream';
    const okExt = /\.(png|jpe?g|webp|gif|bmp)$/i.test(name);
    if (!okMime && !okExt) {
      throw new BadRequestException('Only image files are supported');
    }

    try {
      const result = await this.worker.extract(
        file.buffer,
        file.originalname || 'image.png',
      );
      return {
        ...result,
        originalName: file.originalname || 'image.png',
        workerAvailable: await this.worker.isHealthy(),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'OCR failed';
      throw new ServiceUnavailableException(
        `Image to text worker unavailable. Start Services/image-to-text on port 8108. ${message}`,
      );
    }
  }
}
