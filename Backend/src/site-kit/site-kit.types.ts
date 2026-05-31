export type SiteKitModules = {
  analytics: boolean;
  searchConsole: boolean;
  pagespeed: boolean;
  adsense: boolean;
};

export type SiteKitStoredSettings = {
  connected: boolean;
  connectedAt?: string;
  email?: string;
  refreshToken?: string;
  accessToken?: string;
  tokenExpiresAt?: number;
  propertyId?: string;
  siteUrl?: string;
  modules: SiteKitModules;
  adsenseConnected?: boolean;
};

export const DEFAULT_SITE_KIT_MODULES: SiteKitModules = {
  analytics: true,
  searchConsole: true,
  pagespeed: true,
  adsense: false,
};

export const DEFAULT_SITE_KIT_SETTINGS: SiteKitStoredSettings = {
  connected: false,
  modules: { ...DEFAULT_SITE_KIT_MODULES },
  adsenseConnected: false,
};
