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
import { SplitPdfQueryDto } from './dto/split-pdf.dto';
import { SplitPdfService } from './services/split-pdf.service';

@Controller('split-pdf')
export class SplitPdfController {
  constructor(private readonly splitPdf: SplitPdfService) {}

  @Get('health')
  health() {
    return this.splitPdf.workerHealth();
  }

  @Post('inspect')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 25 * 1024 * 1024 },
    }),
  )
  inspect(@UploadedFile() file: UploadedMemoryFile) {
    return this.splitPdf.inspect(file);
  }

  @Post('split')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 25 * 1024 * 1024 },
    }),
  )
  split(
    @UploadedFile() file: UploadedMemoryFile,
    @Query() query: SplitPdfQueryDto,
  ) {
    return this.splitPdf.split(file, query);
  }
}
