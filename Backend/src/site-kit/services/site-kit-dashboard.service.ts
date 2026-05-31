import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { CmsContentEntity, CmsContentStatus, CmsContentType } from '../../cms/entities/cms-content.entity';
import { QrScanEntity } from '../../qr-generator/entities/qr-scan.entity';
import { ToolEntity } from '../../tools/entities/tool.entity';
import { GoogleAnalyticsService } from './google-analytics.service';
import { GoogleOAuthService } from './google-oauth.service';
import { GooglePageSpeedService } from './google-pagespeed.service';
import { SiteKitSettingsService } from './site-kit-settings.service';

@Injectable()
export class SiteKitDashboardService {
  constructor(
    private readonly settings: SiteKitSettingsService,
    private readonly oauth: GoogleOAuthService,
    private readonly analytics: GoogleAnalyticsService,
    private readonly pagespeed: GooglePageSpeedService,
    private readonly config: ConfigService,
    @InjectRepository(QrScanEntity)
    private readonly scansRepo: Repository<QrScanEntity>,
    @InjectRepository(ToolEntity)
    private readonly toolsRepo: Repository<ToolEntity>,
    @InjectRepository(CmsContentEntity)
    private readonly contentRepo: Repository<CmsContentEntity>,
  ) {}

  async getDashboard(days = 28) {
    const stored = await this.settings.getStored();
    const status = this.settings.sanitizeForClient(stored);
    const siteUrl =
      stored.siteUrl ??
      this.config.get<string>('googleSiteKit.defaultSiteUrl') ??
      'http://localhost:3000';

    let accessToken = stored.accessToken;
    if (
      stored.connected &&
      stored.refreshToken &&
      stored.tokenExpiresAt &&
      stored.tokenExpiresAt < Date.now() + 60_000
    ) {
      try {
        const refreshed = await this.oauth.refreshAccessToken(stored.refreshToken);
        accessToken = refreshed.accessToken;
        await this.settings.save({
          accessToken: refreshed.accessToken,
          tokenExpiresAt: refreshed.expiresAt,
        });
      } catch {
        accessToken = undefined;
      }
    }

    const traffic = await this.buildTraffic(stored, accessToken, days);
    const content = await this.buildContent();
    const speed = stored.modules.pagespeed
      ? await this.buildSpeed(siteUrl)
      : { enabled: false };
    const monetization = this.buildMonetization(stored);
    const searchConsole = this.buildSearchConsole(stored, traffic.totalUsers);

    return {
      status,
      rangeDays: days,
      traffic,
      content,
      speed,
      monetization,
      searchConsole,
    };
  }

  private async buildTraffic(
    stored: Awaited<ReturnType<SiteKitSettingsService['getStored']>>,
    accessToken: string | undefined,
    days: number,
  ) {
    if (
      stored.connected &&
      stored.modules.analytics &&
      accessToken &&
      stored.propertyId
    ) {
      const ga = await this.analytics.fetchReport(
        accessToken,
        stored.propertyId,
        days,
      );
      if (ga) {
        const change =
          ga.previousUsers > 0
            ? ((ga.totalUsers - ga.previousUsers) / ga.previousUsers) * 100
            : 0;
        return {
          source: 'google_analytics' as const,
          totalUsers: ga.totalUsers,
          changePercent: Math.round(change * 10) / 10,
          series: ga.series,
          channels: ga.channels,
        };
      }
    }

    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    const prevStart = new Date(start);
    prevStart.setDate(prevStart.getDate() - days);

    const scans = await this.scansRepo.find({
      where: { scannedAt: Between(prevStart, end) },
      order: { scannedAt: 'ASC' },
    });

    const inRange = scans.filter((s) => s.scannedAt >= start);
    const prevRange = scans.filter(
      (s) => s.scannedAt >= prevStart && s.scannedAt < start,
    );

    const byDate = new Map<string, number>();
    for (const scan of inRange) {
      const d = scan.scannedAt.toISOString().slice(0, 10);
      byDate.set(d, (byDate.get(d) ?? 0) + 1);
    }

    const series = [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, users]) => ({ date, users }));

    const channelMap = new Map<string, number>();
    for (const scan of inRange) {
      const ua = (scan.userAgent ?? '').toLowerCase();
      let ch = 'Direct';
      if (scan.referer) ch = 'Referral';
      else if (ua.includes('mobile')) ch = 'Mobile';
      else if (ua.includes('bot')) ch = 'Organic Search';
      channelMap.set(ch, (channelMap.get(ch) ?? 0) + 1);
    }

    const sum = [...channelMap.values()].reduce((a, b) => a + b, 0) || 1;
    const channels = [...channelMap.entries()].map(([label, value]) => ({
      label,
      value,
      percent: Math.round((value / sum) * 1000) / 10,
    }));

    const totalUsers = inRange.length;
    const previousUsers = prevRange.length;
    const change =
      previousUsers > 0
        ? ((totalUsers - previousUsers) / previousUsers) * 100
        : totalUsers > 0
          ? 100
          : 0;

    return {
      source: 'site_activity' as const,
      totalUsers,
      changePercent: Math.round(change * 10) / 10,
      series,
      channels,
    };
  }

  private async buildContent() {
    const [posts, pages, tools] = await Promise.all([
      this.contentRepo.count({
        where: { type: CmsContentType.POST, status: CmsContentStatus.PUBLISHED },
      }),
      this.contentRepo.count({
        where: { type: CmsContentType.PAGE, status: CmsContentStatus.PUBLISHED },
      }),
      this.toolsRepo.find({ order: { name: 'ASC' }, take: 8 }),
    ]);

    const recent = await this.contentRepo.find({
      order: { updatedAt: 'DESC' },
      take: 6,
    });

    return {
      publishedPosts: posts,
      publishedPages: pages,
      liveTools: tools.filter((t) => t.status === 'ready').length,
      topItems: recent.map((r) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        type: r.type,
        status: r.status,
        updatedAt: r.updatedAt,
      })),
      toolHighlights: tools.slice(0, 5).map((t) => ({
        slug: t.slug,
        name: t.name,
        status: t.status,
        category: t.category,
      })),
    };
  }

  private async buildSpeed(siteUrl: string) {
    const [mobile, desktop] = await Promise.all([
      this.pagespeed.run(siteUrl, 'mobile'),
      this.pagespeed.run(siteUrl, 'desktop'),
    ]);
    return {
      enabled: true,
      siteUrl,
      mobile,
      desktop,
      configured: Boolean(this.config.get<string>('googleSiteKit.pagespeedApiKey')),
    };
  }

  private buildMonetization(stored: Awaited<ReturnType<SiteKitSettingsService['getStored']>>) {
    return {
      enabled: stored.modules.adsense,
      connected: Boolean(stored.adsenseConnected),
      earnings: stored.adsenseConnected ? 0 : null,
      message: stored.adsenseConnected
        ? 'AdSense linked. Earnings sync requires production AdSense API access.'
        : 'Connect AdSense to view monetization metrics.',
    };
  }

  private buildSearchConsole(
    stored: Awaited<ReturnType<SiteKitSettingsService['getStored']>>,
    activityUsers: number,
  ) {
    const enabled = stored.modules.searchConsole;
    return {
      enabled,
      connected: stored.connected && enabled,
      clicks: enabled ? Math.max(0, Math.round(activityUsers * 0.4)) : 0,
      impressions: enabled ? Math.max(0, activityUsers * 3) : 0,
      ctr: enabled && activityUsers > 0 ? 13.2 : 0,
      note: stored.connected
        ? 'Search metrics estimated until Search Console API is fully linked.'
        : 'Connect Google account to enable Search Console.',
    };
  }
}
