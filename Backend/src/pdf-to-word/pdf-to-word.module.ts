import { Module } from '@nestjs/common';
import { PdfToWordController } from './pdf-to-word.controller';
import { PdfToWordService } from './services/pdf-to-word.service';
import { PdfWorkerClient } from './services/pdf-worker.client';

@Module({
  controllers: [PdfToWordController],
  providers: [PdfToWordService, PdfWorkerClient],
  exports: [PdfToWordService],
})
export class PdfToWordModule {}
