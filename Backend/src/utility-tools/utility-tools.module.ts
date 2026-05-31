import { Module } from '@nestjs/common';
import { IpLookupController } from './ip-lookup.controller';
import { MarkdownEditorController } from './markdown-editor.controller';
import { PaletteGeneratorController } from './palette-generator.controller';
import { PasswordGeneratorController } from './password-generator.controller';
import { SpeedTestController } from './speed-test.controller';
import { SqlFormatterController } from './sql-formatter.controller';
import { WhoisLookupController } from './whois-lookup.controller';
import { YoutubeThumbnailController } from './youtube-thumbnail.controller';
import { IpLookupService } from './services/ip-lookup.service';
import { MarkdownEditorService } from './services/markdown-editor.service';
import { PaletteGeneratorService } from './services/palette-generator.service';
import { PasswordGeneratorService } from './services/password-generator.service';
import { SpeedTestService } from './services/speed-test.service';
import { SqlFormatterService } from './services/sql-formatter.service';
import { WhoisLookupService } from './services/whois-lookup.service';
import { YoutubeThumbnailService } from './services/youtube-thumbnail.service';

@Module({
  controllers: [
    SqlFormatterController,
    PasswordGeneratorController,
    PaletteGeneratorController,
    MarkdownEditorController,
    YoutubeThumbnailController,
    WhoisLookupController,
    IpLookupController,
    SpeedTestController,
  ],
  providers: [
    SqlFormatterService,
    PasswordGeneratorService,
    PaletteGeneratorService,
    MarkdownEditorService,
    YoutubeThumbnailService,
    WhoisLookupService,
    IpLookupService,
    SpeedTestService,
  ],
})
export class UtilityToolsModule {}
