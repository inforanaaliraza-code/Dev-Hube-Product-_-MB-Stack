import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QrCodeEntity } from './entities/qr-code.entity';
import { QrScanEntity } from './entities/qr-scan.entity';
import { QrGeneratorController } from './qr-generator.controller';
import { QrGeneratorService } from './services/qr-generator.service';
import { QrWorkerClient } from './services/qr-worker.client';

@Module({
  imports: [TypeOrmModule.forFeature([QrCodeEntity, QrScanEntity])],
  controllers: [QrGeneratorController],
  providers: [QrGeneratorService, QrWorkerClient],
  exports: [QrGeneratorService],
})
export class QrGeneratorModule {}
