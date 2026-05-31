import { Controller, Get, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedMemoryFile } from '../common/uploaded-file.type';
import { ImageConverterService } from './services/image-converter.service';

@Controller('image-converter')
export class ImageConverterController {
  constructor(private readonly images: ImageConverterService) {}

  @Get('health')
  health() {
    return this.images.workerHealth();
  }

  @Post('convert')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 15 * 1024 * 1024 } }))
  convert(@UploadedFile() file: UploadedMemoryFile, @Query('format') format?: string) {
    return this.images.convert(file, format ?? 'webp');
  }
}
