import { Controller, Get, Param } from '@nestjs/common';
import { ToolBlogService } from './tool-blog.service';

@Controller('site')
export class ToolBlogPublicController {
  constructor(private readonly toolBlog: ToolBlogService) {}

  @Get('tool-blogs')
  listPublished() {
    return this.toolBlog.listPublished();
  }

  @Get('tools/:slug/blog')
  getByTool(@Param('slug') slug: string) {
    return this.toolBlog.getPublishedByToolSlug(slug);
  }
}
