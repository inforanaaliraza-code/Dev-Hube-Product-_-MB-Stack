import { Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedMemoryFile } from '../common/uploaded-file.type';
import { ImageToTextService } from './services/image-to-text.service';

@Controller('image-to-text')
export class ImageToTextController {
  constructor(private readonly imageToText: ImageToTextService) {}

  @Get('health')
  health() {
    return this.imageToText.workerHealth();
  }

  @Post('extract')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 15 * 1024 * 1024 } }))
  extract(@UploadedFile() file: UploadedMemoryFile) {
    return this.imageToText.extract(file);
  }
}
