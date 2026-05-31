import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CmsContentEntity } from '../cms/entities/cms-content.entity';
import { QrScanEntity } from '../qr-generator/entities/qr-scan.entity';
import { SettingsModule } from '../settings/settings.module';
import { ToolEntity } from '../tools/entities/tool.entity';
import { SiteKitAdminController } from './site-kit-admin.controller';
import { GoogleAnalyticsService } from './services/google-analytics.service';
import { GoogleOAuthService } from './services/google-oauth.service';
import { GooglePageSpeedService } from './services/google-pagespeed.service';
import { SiteKitDashboardService } from './services/site-kit-dashboard.service';
import { SiteKitSettingsService } from './services/site-kit-settings.service';

@Module({
  imports: [
    SettingsModule,
    TypeOrmModule.forFeature([QrScanEntity, ToolEntity, CmsContentEntity]),
  ],
  controllers: [SiteKitAdminController],
  providers: [
    SiteKitSettingsService,
    GoogleOAuthService,
    GoogleAnalyticsService,
    GooglePageSpeedService,
    SiteKitDashboardService,
  ],
  exports: [SiteKitSettingsService],
})
export class SiteKitModule {}
