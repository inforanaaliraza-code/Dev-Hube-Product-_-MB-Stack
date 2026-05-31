import { Module } from '@nestjs/common';
import { ImageToTextController } from './image-to-text.controller';
import { ImageToTextService } from './services/image-to-text.service';
import { ImageToTextWorkerClient } from './services/image-to-text-worker.client';

@Module({
  controllers: [ImageToTextController],
  providers: [ImageToTextService, ImageToTextWorkerClient],
})
export class ImageToTextModule {}
