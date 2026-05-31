import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PluginEntity } from './entities/plugin.entity';
import { PluginsAdminController } from './plugins-admin.controller';
import { PluginsService } from './plugins.service';

@Module({
  imports: [TypeOrmModule.forFeature([PluginEntity])],
  controllers: [PluginsAdminController],
  providers: [PluginsService],
  exports: [PluginsService],
})
export class PluginsModule {}
