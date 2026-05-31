import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UploadedMemoryFile } from '../common/uploaded-file.type';
import { UserEntity } from '../users/entities/user.entity';
import { UserRole } from '../users/user-role.enum';
import { BulkContentDto } from './dto/bulk-content.dto';
import { BulkMediaDto } from './dto/bulk-media.dto';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { UpdateNavigationDto } from './dto/update-navigation.dto';
import { CmsContentType } from './entities/cms-content.entity';
import { ContentService } from './services/content.service';
import { MediaService } from './services/media.service';
import { NavigationService } from './services/navigation.service';

@Controller('admin/cms')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class CmsAdminController {
  constructor(
    private readonly media: MediaService,
    private readonly content: ContentService,
    private readonly navigation: NavigationService,
  ) {}

  @Get('media')
  listMedia() {
    return this.media.list();
  }

  @Post('media')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadMedia(
    @UploadedFile() file: UploadedMemoryFile,
    @Body('alt') alt?: string,
  ) {
    return this.media.upload(file, alt);
  }

  @Delete('media/:id')
  deleteMedia(@Param('id') id: string) {
    return this.media.remove(id);
  }

  @Post('media/bulk')
  bulkMedia(@Body() dto: BulkMediaDto) {
    return this.media.bulkDelete(dto.ids);
  }

  @Get('contents')
  listContents(@Query('type') type?: CmsContentType) {
    return this.content.adminList(type);
  }

  @Post('contents/bulk')
  bulkContents(@Body() dto: BulkContentDto) {
    return this.content.bulk(dto.ids, dto.action, dto.status);
  }

  @Get('contents/:id')
  getContent(@Param('id') id: string) {
    return this.content.adminGet(id);
  }

  @Post('contents')
  createContent(@Body() dto: CreateContentDto, @CurrentUser() user: UserEntity) {
    return this.content.create(dto, user);
  }

  @Patch('contents/:id')
  updateContent(@Param('id') id: string, @Body() dto: UpdateContentDto) {
    return this.content.update(id, dto);
  }

  @Delete('contents/:id')
  deleteContent(@Param('id') id: string) {
    return this.content.remove(id);
  }

  @Get('navigation')
  getNavigation() {
    return this.navigation.getItems();
  }

  @Patch('navigation')
  updateNavigation(
    @Body() dto: UpdateNavigationDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.navigation.updateItems(dto.items, user);
  }

}
