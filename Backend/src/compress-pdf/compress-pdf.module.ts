import { Module } from '@nestjs/common';
import { CompressPdfController } from './compress-pdf.controller';
import { CompressPdfService } from './services/compress-pdf.service';
import { CompressPdfWorkerClient } from './services/compress-pdf-worker.client';

@Module({
  controllers: [CompressPdfController],
  providers: [CompressPdfService, CompressPdfWorkerClient],
})
export class CompressPdfModule {}
