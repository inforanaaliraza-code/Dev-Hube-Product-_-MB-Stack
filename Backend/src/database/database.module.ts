import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminAuditLogEntity } from '../audit/entities/admin-audit-log.entity';
import { migrations } from './migrations';
import { ToolFavoriteEntity } from '../favorites/entities/tool-favorite.entity';
import { SiteSettingEntity } from '../settings/entities/site-setting.entity';
import { QrCodeEntity } from '../qr-generator/entities/qr-code.entity';
import { QrScanEntity } from '../qr-generator/entities/qr-scan.entity';
import { TempMailboxEntity } from '../temp-mail/entities/temp-mailbox.entity';
import { ToolEntity } from '../tools/entities/tool.entity';
import { UserEntity } from '../users/entities/user.entity';

const entities = [
  UserEntity,
  ToolEntity,
  SiteSettingEntity,
  AdminAuditLogEntity,
  ToolFavoriteEntity,
  TempMailboxEntity,
  QrCodeEntity,
  QrScanEntity,
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.get<string>('nodeEnv') === 'production';
        const useMigrations = process.env.DB_USE_MIGRATIONS === 'true';
        const syncEnabled =
          process.env.DB_SYNC === 'true' || (!isProd && !useMigrations);
        const migrationsRun =
          useMigrations && process.env.RUN_MIGRATIONS !== 'false';
        return {
          type: 'postgres' as const,
          host: config.get<string>('database.host'),
          port: config.get<number>('database.port'),
          username: config.get<string>('database.username'),
          password: config.get<string>('database.password'),
          database: config.get<string>('database.name'),
          entities,
          synchronize: syncEnabled,
          migrations,
          migrationsRun,
          logging: !isProd,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
