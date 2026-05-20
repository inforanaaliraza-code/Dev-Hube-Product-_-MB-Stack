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
import { ConvertPdfQueryDto } from './dto/convert-pdf.dto';
import { PdfToWordService } from './services/pdf-to-word.service';

@Controller('pdf-to-word')
export class PdfToWordController {
  constructor(private readonly pdfToWord: PdfToWordService) {}

  @Get('health')
  health() {
    return this.pdfToWord.workerHealth();
  }

  @Post('convert')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 25 * 1024 * 1024 },
    }),
  )
  convert(
    @UploadedFile() file: UploadedMemoryFile,
    @Query() query: ConvertPdfQueryDto,
  ) {
    return this.pdfToWord.convert(file, query);
  }
}
