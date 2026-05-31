import { Module } from '@nestjs/common';
import { SplitPdfController } from './split-pdf.controller';
import { SplitPdfService } from './services/split-pdf.service';
import { SplitPdfWorkerClient } from './services/split-pdf-worker.client';

@Module({
  controllers: [SplitPdfController],
  providers: [SplitPdfService, SplitPdfWorkerClient],
  exports: [SplitPdfService],
})
export class SplitPdfModule {}
