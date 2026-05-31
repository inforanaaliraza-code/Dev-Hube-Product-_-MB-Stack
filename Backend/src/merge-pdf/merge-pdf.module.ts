import { Module } from '@nestjs/common';
import { MergePdfController } from './merge-pdf.controller';
import { MergePdfService } from './services/merge-pdf.service';
import { MergePdfWorkerClient } from './services/merge-pdf-worker.client';

@Module({
  controllers: [MergePdfController],
  providers: [MergePdfService, MergePdfWorkerClient],
  exports: [MergePdfService],
})
export class MergePdfModule {}
