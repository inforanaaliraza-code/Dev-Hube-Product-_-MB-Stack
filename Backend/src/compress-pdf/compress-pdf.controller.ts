import {
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedMemoryFile } from '../common/uploaded-file.type';
import { CompressPdfService } from './services/compress-pdf.service';

@Controller('compress-pdf')
export class CompressPdfController {
  constructor(private readonly compressPdf: CompressPdfService) {}

  @Get('health')
  health() {
    return this.compressPdf.workerHealth();
  }

  @Post('compress')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 25 * 1024 * 1024 },
    }),
  )
  compress(
    @UploadedFile() file: UploadedMemoryFile,
    @Query('level') level?: string,
  ) {
    return this.compressPdf.compress(file, level ?? 'medium');
  }
}
