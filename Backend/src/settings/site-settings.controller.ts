import { Controller, Get } from '@nestjs/common';
import {
  DEFAULT_NAVIGATION,
  type NavItem,
} from '../cms/services/navigation.service';
import { SettingsService } from './settings.service';

@Controller('site')
export class SiteSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('settings')
  async getPublicSettings() {
    const all = await this.settingsService.getAll();
    const site = (all.site ?? {}) as Record<string, unknown>;
    const gallery = (all.gallery ?? {}) as Record<string, unknown>;
    const navSetting = all.navigation as { items?: NavItem[] } | undefined;
    const raw = navSetting?.items?.length ? navSetting.items : DEFAULT_NAVIGATION;
    const navigation = [...raw]
      .filter((i) => i.enabled)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return {
      siteName: String(site.siteName ?? 'Dev Hube'),
      publicSiteUrl: String(site.publicSiteUrl ?? 'http://localhost:3000'),
      maintenanceMode: Boolean(site.maintenanceMode ?? false),
      tagline: String(site.tagline ?? "The developer's utility hub"),
      heroTitle: String(site.heroTitle ?? 'Build faster with'),
      heroSubtitle: String(site.heroSubtitle ?? '50+ utilities in one premium hub.'),
      gallery: {
        bend: Number(gallery.bend ?? 1),
        scrollSpeed: Number(gallery.scrollSpeed ?? 2),
        scrollEase: Number(gallery.scrollEase ?? 0.05),
      },
      navigation,
    };
  }
}
