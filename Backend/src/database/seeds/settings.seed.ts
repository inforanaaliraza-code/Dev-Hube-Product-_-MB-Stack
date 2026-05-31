import { Repository } from 'typeorm';
import { SiteSettingEntity } from '../../settings/entities/site-setting.entity';

export const DEFAULT_SITE_SETTINGS: Record<string, Record<string, unknown>> = {
  site: {
    siteName: 'Dev Hube',
    publicSiteUrl: process.env.PUBLIC_SITE_URL ?? 'http://localhost:3000',
    maintenanceMode: false,
    tagline: "The developer's utility hub",
    heroTitle: 'Build faster with',
    heroSubtitle: '50+ utilities in one premium hub.',
  },
  gallery: {
    bend: 1,
    scrollSpeed: 2,
    scrollEase: 0.05,
  },
  navigation: {
    items: [
      { id: 'home', label: 'Home', href: '/', target: '_self', sortOrder: 0, enabled: true },
      { id: 'tools', label: 'Tools', href: '/tools', target: '_self', sortOrder: 1, enabled: true },
      { id: 'blog', label: 'Blog', href: '/blog', target: '_self', sortOrder: 2, enabled: true },
    ],
  },
  googleSiteKit: {
    connected: false,
    modules: {
      analytics: true,
      searchConsole: true,
      pagespeed: true,
      adsense: false,
    },
    adsenseConnected: false,
  },
};

export async function seedSettings(settingsRepo: Repository<SiteSettingEntity>) {
  for (const [key, value] of Object.entries(DEFAULT_SITE_SETTINGS)) {
    const exists = await settingsRepo.findOne({ where: { key } });
    if (!exists) {
      await settingsRepo.save(settingsRepo.create({ key, value }));
    }
  }
}
