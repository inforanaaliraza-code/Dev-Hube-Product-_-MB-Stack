import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { UploadedMemoryFile } from '../../common/uploaded-file.type';
import { ImageConverterWorkerClient } from './image-converter-worker.client';

@Injectable()
export class ImageConverterService {
  async workerHealth() {
    return { ok: await this.worker.isHealthy() };
  }

  constructor(private readonly worker: ImageConverterWorkerClient) {}

  async convert(file: UploadedMemoryFile | undefined, format: string) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Image file is required');
    }
    const fmt = (format || 'webp').toLowerCase();
    if (!['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'].includes(fmt)) {
      throw new BadRequestException('Unsupported output format');
    }
    try {
      const result = await this.worker.convert(
        file.buffer,
        file.originalname || 'image.png',
        fmt,
      );
      return {
        ...result,
        mime: fmt === 'jpg' || fmt === 'jpeg' ? 'image/jpeg' : `image/${fmt}`,
        workerAvailable: await this.worker.isHealthy(),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Conversion failed';
      throw new ServiceUnavailableException(
        `Image converter worker unavailable. Start Services/image-converter on 8110. ${message}`,
      );
    }
  }
}
