import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { AdminModule } from './admin/admin.module';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { SettingsModule } from './settings/settings.module';
import { ImageCompressorModule } from './image-compressor/image-compressor.module';
import { PdfToWordModule } from './pdf-to-word/pdf-to-word.module';
import { QrGeneratorModule } from './qr-generator/qr-generator.module';
import { TempMailModule } from './temp-mail/temp-mail.module';
import { ToolsModule } from './tools/tools.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    SettingsModule,
    AuditModule,
    HealthModule,
    ToolsModule,
    TempMailModule,
    QrGeneratorModule,
    ImageCompressorModule,
    PdfToWordModule,
    AdminModule,
  ],
})
export class AppModule {}
