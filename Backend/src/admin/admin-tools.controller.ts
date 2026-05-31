import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BulkToolsDto } from '../tools/dto/bulk-tools.dto';
import { CreateToolDto } from '../tools/dto/create-tool.dto';
import { QueryToolsDto } from '../tools/dto/query-tools.dto';
import { UpdateToolDto } from '../tools/dto/update-tool.dto';
import { UpsertToolBlogDto } from '../tools/dto/upsert-tool-blog.dto';
import { ToolBlogService } from '../tools/tool-blog.service';
import { ToolsService } from '../tools/tools.service';
import { UserEntity } from '../users/entities/user.entity';
import { UserRole } from '../users/user-role.enum';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminToolsController {
  constructor(
    private readonly toolsService: ToolsService,
    private readonly toolBlogService: ToolBlogService,
  ) {}

  @Get('tools')
  findAll(@Query() query: QueryToolsDto) {
    return this.toolsService.findAll(query);
  }

  @Get('tools/:slug/blog')
  getToolBlog(@Param('slug') slug: string) {
    return this.toolBlogService.adminGet(slug);
  }

  @Put('tools/:slug/blog')
  upsertToolBlog(@Param('slug') slug: string, @Body() dto: UpsertToolBlogDto) {
    return this.toolBlogService.adminUpsert(slug, dto);
  }

  @Delete('tools/:slug/blog')
  deleteToolBlog(@Param('slug') slug: string) {
    return this.toolBlogService.deleteByToolSlug(slug);
  }

  @Get('tools/:slug')
  findOne(@Param('slug') slug: string) {
    return this.toolsService.findBySlug(slug);
  }

  @Post('tools')
  create(@Body() dto: CreateToolDto, @CurrentUser() user: UserEntity) {
    return this.toolsService.create(dto, user);
  }

  @Post('tools/bulk')
  bulkTools(@Body() dto: BulkToolsDto, @CurrentUser() user: UserEntity) {
    return this.toolsService.bulk(dto.slugs, dto.action, {
      status: dto.status,
      featured: dto.featured,
    }, user);
  }

  @Patch('tools/:slug')
  update(
    @Param('slug') slug: string,
    @Body() dto: UpdateToolDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.toolsService.update(slug, dto, user);
  }

  @Delete('tools/:slug')
  remove(@Param('slug') slug: string, @CurrentUser() user: UserEntity) {
    return this.toolsService.remove(slug, user);
  }

  @Get('categories')
  getCategories() {
    return this.toolsService.getCategories();
  }
}
