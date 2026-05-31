import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ToolBlogService } from '../tools/tool-blog.service';
import { UserRole } from '../users/user-role.enum';

@Controller('admin/tool-blogs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminToolBlogsController {
  constructor(private readonly toolBlogService: ToolBlogService) {}

  @Get()
  listAll() {
    return this.toolBlogService.adminListAll();
  }
}
