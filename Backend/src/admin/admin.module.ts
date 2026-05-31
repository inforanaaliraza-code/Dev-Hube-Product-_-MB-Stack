import { Module } from '@nestjs/common';
import { ToolsModule } from '../tools/tools.module';
import { AdminToolBlogsController } from './admin-tool-blogs.controller';
import { AdminToolsController } from './admin-tools.controller';

@Module({
  imports: [ToolsModule],
  controllers: [AdminToolsController, AdminToolBlogsController],
})
export class AdminModule {}
