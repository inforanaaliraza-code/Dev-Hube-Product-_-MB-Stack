import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryToolsDto } from './dto/query-tools.dto';
import { ToolsService } from './tools.service';

@Controller()
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Get('tools')
  findAll(@Query() query: QueryToolsDto) {
    return this.toolsService.findAll(query);
  }

  @Get('tools/:slug')
  findOne(@Param('slug') slug: string) {
    return this.toolsService.findBySlug(slug);
  }

  @Get('categories')
  getCategories() {
    return this.toolsService.getCategories();
  }
}
