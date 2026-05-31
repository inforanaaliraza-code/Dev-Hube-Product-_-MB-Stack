import { Controller, Get, Param } from '@nestjs/common';
import { ContentService } from './services/content.service';
import { NavigationService } from './services/navigation.service';

@Controller('site')
export class CmsPublicController {
  constructor(
    private readonly content: ContentService,
    private readonly navigation: NavigationService,
  ) {}

  @Get('navigation')
  getNavigation() {
    return this.navigation.getPublicItems();
  }

  @Get('pages/:slug')
  getPage(@Param('slug') slug: string) {
    return this.content.getPublishedPage(slug);
  }

  @Get('posts')
  listPosts() {
    return this.content.listPublishedPosts();
  }

  @Get('posts/:slug')
  getPost(@Param('slug') slug: string) {
    return this.content.getPublishedPost(slug);
  }
}
