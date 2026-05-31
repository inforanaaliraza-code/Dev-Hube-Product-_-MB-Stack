import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsModule } from '../settings/settings.module';
import { CmsAdminController } from './cms-admin.controller';
import { CmsPublicController } from './cms-public.controller';
import { CmsContentEntity } from './entities/cms-content.entity';
import { MediaAssetEntity } from './entities/media-asset.entity';
import { ContentService } from './services/content.service';
import { MediaService } from './services/media.service';
import { NavigationService } from './services/navigation.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([MediaAssetEntity, CmsContentEntity]),
    SettingsModule,
  ],
  controllers: [CmsAdminController, CmsPublicController],
  providers: [MediaService, ContentService, NavigationService],
  exports: [NavigationService],
})
export class CmsModule {}
