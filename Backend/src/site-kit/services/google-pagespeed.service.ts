import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GooglePageSpeedService {
  constructor(private readonly config: ConfigService) {}

  async run(url: string, strategy: 'mobile' | 'desktop' = 'mobile') {
    const apiKey = this.config.get<string>('googleSiteKit.pagespeedApiKey');
    if (!apiKey?.trim()) return null;

    const params = new URLSearchParams({
      url,
      key: apiKey,
      strategy,
      category: 'performance',
    });

    const res = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`,
    );
    if (!res.ok) return null;

    const data = (await res.json()) as {
      lighthouseResult?: {
        categories?: { performance?: { score?: number } };
        audits?: {
          'first-contentful-paint'?: { displayValue?: string };
          'largest-contentful-paint'?: { displayValue?: string };
          'total-blocking-time'?: { displayValue?: string };
          'cumulative-layout-shift'?: { displayValue?: string };
        };
      };
    };

    const perf = data.lighthouseResult?.categories?.performance?.score;
    const audits = data.lighthouseResult?.audits ?? {};
    return {
      strategy,
      score: perf != null ? Math.round(perf * 100) : null,
      fcp: audits['first-contentful-paint']?.displayValue ?? '—',
      lcp: audits['largest-contentful-paint']?.displayValue ?? '—',
      tbt: audits['total-blocking-time']?.displayValue ?? '—',
      cls: audits['cumulative-layout-shift']?.displayValue ?? '—',
    };
  }
}
