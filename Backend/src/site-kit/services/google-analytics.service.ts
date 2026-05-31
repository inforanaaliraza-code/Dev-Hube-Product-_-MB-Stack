import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleAnalyticsService {
  async fetchReport(
    accessToken: string,
    propertyId: string,
    days: number,
  ): Promise<{
    totalUsers: number;
    previousUsers: number;
    series: { date: string; users: number }[];
    channels: { label: string; value: number; percent: number }[];
  } | null> {
    const prop = propertyId.startsWith('properties/')
      ? propertyId
      : `properties/${propertyId}`;
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - days);

    const body = {
      dateRanges: [
        { startDate: this.fmt(start), endDate: this.fmt(end) },
        { startDate: this.fmt(prevStart), endDate: this.fmt(prevEnd) },
      ],
      metrics: [{ name: 'activeUsers' }],
      dimensions: [{ name: 'date' }, { name: 'sessionDefaultChannelGroup' }],
    };

    const res = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/${prop}:runReport`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) return null;

    const data = (await res.json()) as {
      rows?: Array<{
        dimensionValues?: Array<{ value?: string }>;
        metricValues?: Array<{ value?: string }>;
      }>;
    };

    const byDate = new Map<string, number>();
    const channelTotals = new Map<string, number>();
    let totalUsers = 0;
    let previousUsers = 0;

    for (const row of data.rows ?? []) {
      const date = row.dimensionValues?.[0]?.value ?? '';
      const channel = row.dimensionValues?.[1]?.value ?? 'Direct';
      const users = Number(row.metricValues?.[0]?.value ?? 0);
      if (!date) continue;
      if (date >= this.fmt(start) && date <= this.fmt(end)) {
        byDate.set(date, (byDate.get(date) ?? 0) + users);
        channelTotals.set(channel, (channelTotals.get(channel) ?? 0) + users);
        totalUsers += users;
      } else {
        previousUsers += users;
      }
    }

    const series = [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, users]) => ({ date, users }));

    const channelSum = [...channelTotals.values()].reduce((a, b) => a + b, 0) || 1;
    const channels = [...channelTotals.entries()]
      .map(([label, value]) => ({
        label,
        value,
        percent: Math.round((value / channelSum) * 1000) / 10,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    return { totalUsers, previousUsers, series, channels };
  }

  private fmt(d: Date) {
    return d.toISOString().slice(0, 10);
  }
}
