import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/user-role.enum';
import { BulkPluginsDto } from './dto/bulk-plugins.dto';
import { CreatePluginDto } from './dto/create-plugin.dto';
import { UpdatePluginDto } from './dto/update-plugin.dto';
import { PluginType } from './entities/plugin.entity';
import { PluginsService } from './plugins.service';

@Controller('admin/plugins')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class PluginsAdminController {
  constructor(private readonly plugins: PluginsService) {}

  @Get()
  findAll(@Query('type') type?: string) {
    const filter =
      type && Object.values(PluginType).includes(type as PluginType)
        ? (type as PluginType)
        : undefined;
    return this.plugins.findAll(filter);
  }

  @Post('bulk/actions')
  bulk(@Body() dto: BulkPluginsDto) {
    return this.plugins.bulk(dto.ids, dto.action, dto.status);
  }

  @Post()
  create(@Body() dto: CreatePluginDto) {
    return this.plugins.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plugins.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePluginDto) {
    return this.plugins.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.plugins.remove(id);
  }
}
