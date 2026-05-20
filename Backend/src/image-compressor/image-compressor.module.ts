import { Module } from '@nestjs/common';
import { ImageCompressorController } from './image-compressor.controller';
import { ImageCompressorService } from './services/image-compressor.service';
import { ImageWorkerClient } from './services/image-worker.client';

@Module({
  controllers: [ImageCompressorController],
  providers: [ImageCompressorService, ImageWorkerClient],
  exports: [ImageCompressorService],
})
export class ImageCompressorModule {}
