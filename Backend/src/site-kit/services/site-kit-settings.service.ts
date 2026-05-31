import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../../settings/settings.service';
import { UserEntity } from '../../users/entities/user.entity';
import {
  DEFAULT_SITE_KIT_SETTINGS,
  type SiteKitModules,
  type SiteKitStoredSettings,
} from '../site-kit.types';

const SETTINGS_KEY = 'googleSiteKit';

@Injectable()
export class SiteKitSettingsService {
  constructor(
    private readonly settings: SettingsService,
    private readonly config: ConfigService,
  ) {}

  async getStored(): Promise<SiteKitStoredSettings> {
    const all = await this.settings.getAll();
    const raw = all[SETTINGS_KEY] as Partial<SiteKitStoredSettings> | undefined;
    if (!raw) return { ...DEFAULT_SITE_KIT_SETTINGS };
    return {
      ...DEFAULT_SITE_KIT_SETTINGS,
      ...raw,
      modules: {
        ...DEFAULT_SITE_KIT_SETTINGS.modules,
        ...(raw.modules ?? {}),
      },
    };
  }

  async save(partial: Partial<SiteKitStoredSettings>, user?: UserEntity | null) {
    const current = await this.getStored();
    const next: SiteKitStoredSettings = {
      ...current,
      ...partial,
      modules: {
        ...current.modules,
        ...(partial.modules ?? {}),
      },
    };
    await this.settings.upsert(SETTINGS_KEY, next as unknown as Record<string, unknown>, user);
    return next;
  }

  async disconnect(user?: UserEntity | null) {
    return this.save(
      {
        connected: false,
        email: undefined,
        refreshToken: undefined,
        accessToken: undefined,
        tokenExpiresAt: undefined,
        propertyId: undefined,
        adsenseConnected: false,
      },
      user,
    );
  }

  getPublicStatus(stored: SiteKitStoredSettings) {
    return {
      connected: stored.connected,
      connectedAt: stored.connectedAt ?? null,
      email: stored.email ?? null,
      propertyId: stored.propertyId ?? null,
      siteUrl: stored.siteUrl ?? this.config.get<string>('googleSiteKit.defaultSiteUrl') ?? null,
      modules: stored.modules,
      adsenseConnected: Boolean(stored.adsenseConnected),
      oauthConfigured: Boolean(
        this.config.get<string>('googleSiteKit.clientId') &&
          this.config.get<string>('googleSiteKit.clientSecret'),
      ),
      pagespeedConfigured: Boolean(this.config.get<string>('googleSiteKit.pagespeedApiKey')),
    };
  }

  sanitizeForClient(stored: SiteKitStoredSettings) {
    return this.getPublicStatus(stored);
  }
}
