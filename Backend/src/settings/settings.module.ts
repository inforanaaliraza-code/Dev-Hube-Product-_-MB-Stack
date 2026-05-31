import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminSettingsController } from './admin-settings.controller';
import { SiteSettingEntity } from './entities/site-setting.entity';
import { SiteSettingsController } from './site-settings.controller';
import { SettingsService } from './settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([SiteSettingEntity])],
  controllers: [AdminSettingsController, SiteSettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
