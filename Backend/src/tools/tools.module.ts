import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit/audit.module';
import { MediaAssetEntity } from '../cms/entities/media-asset.entity';
import { ToolBlogPostEntity } from './entities/tool-blog-post.entity';
import { ToolEntity } from './entities/tool.entity';
import { ToolBlogPublicController } from './tool-blog-public.controller';
import { ToolBlogService } from './tool-blog.service';
import { ToolsController } from './tools.controller';
import { ToolsService } from './tools.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ToolEntity, ToolBlogPostEntity, MediaAssetEntity]),
    AuditModule,
  ],
  controllers: [ToolsController, ToolBlogPublicController],
  providers: [ToolsService, ToolBlogService],
  exports: [ToolsService, ToolBlogService],
})
export class ToolsModule {}
