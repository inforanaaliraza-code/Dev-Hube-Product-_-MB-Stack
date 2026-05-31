import { Module } from '@nestjs/common';
import { ImageConverterController } from './image-converter.controller';
import { ImageConverterService } from './services/image-converter.service';
import { ImageConverterWorkerClient } from './services/image-converter-worker.client';

@Module({
  controllers: [ImageConverterController],
  providers: [ImageConverterService, ImageConverterWorkerClient],
})
export class ImageConverterModule {}
