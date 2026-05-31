import 'dotenv/config';
import { DataSource } from 'typeorm';
import { AdminAuditLogEntity } from '../audit/entities/admin-audit-log.entity';
import { ToolFavoriteEntity } from '../favorites/entities/tool-favorite.entity';
import { SiteSettingEntity } from '../settings/entities/site-setting.entity';
import { ToolEntity } from '../tools/entities/tool.entity';
import { UserEntity } from '../users/entities/user.entity';
import { MediaAssetEntity } from '../cms/entities/media-asset.entity';
import { CmsContentEntity } from '../cms/entities/cms-content.entity';
import { migrations } from './migrations';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'dev_hube',
  entities: [
    UserEntity,
    ToolEntity,
    SiteSettingEntity,
    AdminAuditLogEntity,
    ToolFavoriteEntity,
    MediaAssetEntity,
    CmsContentEntity,
  ],
  migrations,
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
});
