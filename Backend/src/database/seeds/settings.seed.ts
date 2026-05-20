import { Repository } from 'typeorm';
import { SiteSettingEntity } from '../../settings/entities/site-setting.entity';

export const DEFAULT_SITE_SETTINGS: Record<string, Record<string, unknown>> = {
  site: {
    siteName: 'Dev Hube',
    publicSiteUrl: process.env.PUBLIC_SITE_URL ?? 'http://localhost:3000',
    maintenanceMode: false,
  },
  gallery: {
    bend: 1,
    scrollSpeed: 2,
    scrollEase: 0.05,
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
