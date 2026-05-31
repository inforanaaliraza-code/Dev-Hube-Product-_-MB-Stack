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
import { AiAssistantSharedModule } from './common/ai-assistant.module';
import { AiCodeGeneratorModule } from './ai-code-generator/ai-code-generator.module';
import { AiResumeBuilderModule } from './ai-resume-builder/ai-resume-builder.module';
import { CompressPdfModule } from './compress-pdf/compress-pdf.module';
import { MergePdfModule } from './merge-pdf/merge-pdf.module';
import { SplitPdfModule } from './split-pdf/split-pdf.module';
import { AiHumanizerModule } from './ai-humanizer/ai-humanizer.module';
import { DevtoolsModule } from './devtools/devtools.module';
import { ImageConverterModule } from './image-converter/image-converter.module';
import { AiParaphraseModule } from './ai-paraphrase/ai-paraphrase.module';
import { ImageToTextModule } from './image-to-text/image-to-text.module';
import { SpeechToTextModule } from './speech-to-text/speech-to-text.module';
import { UtilityToolsModule } from './utility-tools/utility-tools.module';
import { PdfToWordModule } from './pdf-to-word/pdf-to-word.module';
import { QrGeneratorModule } from './qr-generator/qr-generator.module';
import { TempMailModule } from './temp-mail/temp-mail.module';
import { ToolsModule } from './tools/tools.module';
import { UsersModule } from './users/users.module';
import { CmsModule } from './cms/cms.module';
import { SiteKitModule } from './site-kit/site-kit.module';
import { PluginsModule } from './plugins/plugins.module';

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
    MergePdfModule,
    SplitPdfModule,
    CompressPdfModule,
    AiAssistantSharedModule,
    AiCodeGeneratorModule,
    AiResumeBuilderModule,
    UtilityToolsModule,
    ImageToTextModule,
    SpeechToTextModule,
    AiParaphraseModule,
    AiHumanizerModule,
    DevtoolsModule,
    ImageConverterModule,
    AdminModule,
    CmsModule,
    SiteKitModule,
    PluginsModule,
  ],
})
export class AppModule {}
