import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserEntity } from '../users/entities/user.entity';
import { UserRole } from '../users/user-role.enum';
import { SiteKitOAuthCallbackDto } from './dto/site-kit-oauth-callback.dto';
import { UpdateSiteKitDto } from './dto/update-site-kit.dto';
import { GoogleOAuthService } from './services/google-oauth.service';
import { SiteKitDashboardService } from './services/site-kit-dashboard.service';
import { SiteKitSettingsService } from './services/site-kit-settings.service';

@Controller('admin/site-kit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class SiteKitAdminController {
  constructor(
    private readonly settings: SiteKitSettingsService,
    private readonly oauth: GoogleOAuthService,
    private readonly dashboard: SiteKitDashboardService,
  ) {}

  @Get('status')
  async status() {
    const stored = await this.settings.getStored();
    return this.settings.sanitizeForClient(stored);
  }

  @Get('oauth/url')
  oauthUrl() {
    return { url: this.oauth.getAuthUrl() };
  }

  @Post('oauth/callback')
  async oauthCallback(
    @Body() dto: SiteKitOAuthCallbackDto,
    @CurrentUser() user: UserEntity,
  ) {
    const tokens = await this.oauth.exchangeCode(dto.code);
    const stored = await this.settings.save(
      {
        connected: true,
        connectedAt: new Date().toISOString(),
        email: tokens.email,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: tokens.expiresAt,
      },
      user,
    );
    return this.settings.sanitizeForClient(stored);
  }

  @Post('disconnect')
  async disconnect(@CurrentUser() user: UserEntity) {
    const stored = await this.settings.disconnect(user);
    return this.settings.sanitizeForClient(stored);
  }

  @Patch('settings')
  async updateSettings(
    @Body() dto: UpdateSiteKitDto,
    @CurrentUser() user: UserEntity,
  ) {
    const modulePatch: Record<string, boolean> = {};
    if (dto.modules?.analytics !== undefined) modulePatch.analytics = dto.modules.analytics;
    if (dto.modules?.searchConsole !== undefined) {
      modulePatch.searchConsole = dto.modules.searchConsole;
    }
    if (dto.modules?.pagespeed !== undefined) modulePatch.pagespeed = dto.modules.pagespeed;
    if (dto.modules?.adsense !== undefined) modulePatch.adsense = dto.modules.adsense;

    const stored = await this.settings.save(
      {
        ...(dto.propertyId !== undefined ? { propertyId: dto.propertyId } : {}),
        ...(dto.siteUrl !== undefined ? { siteUrl: dto.siteUrl } : {}),
        ...(dto.adsenseConnected !== undefined
          ? { adsenseConnected: dto.adsenseConnected }
          : {}),
        ...(Object.keys(modulePatch).length
          ? { modules: modulePatch as never }
          : {}),
      },
      user,
    );
    return this.settings.sanitizeForClient(stored);
  }

  @Get('dashboard')
  getDashboard(@Query('days') days?: string) {
    const n = Math.min(90, Math.max(7, parseInt(days ?? '28', 10) || 28));
    return this.dashboard.getDashboard(n);
  }
}
