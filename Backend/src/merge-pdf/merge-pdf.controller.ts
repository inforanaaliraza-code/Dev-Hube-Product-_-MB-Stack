import {
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadedMemoryFile } from '../common/uploaded-file.type';
import { MergePdfService } from './services/merge-pdf.service';

@Controller('merge-pdf')
export class MergePdfController {
  constructor(private readonly mergePdf: MergePdfService) {}

  @Get('health')
  health() {
    return this.mergePdf.workerHealth();
  }

  @Post('merge')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      limits: { fileSize: 25 * 1024 * 1024 },
    }),
  )
  merge(@UploadedFiles() files: UploadedMemoryFile[]) {
    return this.mergePdf.merge(files);
  }
}
