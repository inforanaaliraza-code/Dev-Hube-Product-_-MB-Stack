import { ApiError } from "@/lib/api";

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

async function skRequest<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      typeof body.message === "string"
        ? body.message
        : Array.isArray(body.message)
          ? body.message.join(", ")
          : `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }
  return res.json() as Promise<T>;
}

export type SiteKitStatus = {
  connected: boolean;
  connectedAt: string | null;
  email: string | null;
  propertyId: string | null;
  siteUrl: string | null;
  modules: {
    analytics: boolean;
    searchConsole: boolean;
    pagespeed: boolean;
    adsense: boolean;
  };
  adsenseConnected: boolean;
  oauthConfigured: boolean;
  pagespeedConfigured: boolean;
};

export type SiteKitDashboard = {
  status: SiteKitStatus;
  rangeDays: number;
  traffic: {
    source: "google_analytics" | "site_activity";
    totalUsers: number;
    changePercent: number;
    series: { date: string; users: number }[];
    channels: { label: string; value: number; percent: number }[];
  };
  content: {
    publishedPosts: number;
    publishedPages: number;
    liveTools: number;
    topItems: Array<{
      id: string;
      title: string;
      slug: string;
      type: string;
      status: string;
      updatedAt: string;
    }>;
    toolHighlights: Array<{
      slug: string;
      name: string;
      status: string;
      category: string;
    }>;
  };
  speed: {
    enabled: boolean;
    siteUrl?: string;
    mobile?: {
      strategy: string;
      score: number | null;
      fcp: string;
      lcp: string;
      tbt: string;
      cls: string;
    } | null;
    desktop?: {
      strategy: string;
      score: number | null;
      fcp: string;
      lcp: string;
      tbt: string;
      cls: string;
    } | null;
    configured?: boolean;
  };
  monetization: {
    enabled: boolean;
    connected: boolean;
    earnings: number | null;
    message: string;
  };
  searchConsole: {
    enabled: boolean;
    connected: boolean;
    clicks: number;
    impressions: number;
    ctr: number;
    note: string;
  };
};

export const siteKitApi = {
  status(token: string) {
    return skRequest<SiteKitStatus>("/admin/site-kit/status", token);
  },
  oauthUrl(token: string) {
    return skRequest<{ url: string }>("/admin/site-kit/oauth/url", token);
  },
  oauthCallback(token: string, code: string) {
    return skRequest<SiteKitStatus>("/admin/site-kit/oauth/callback", token, {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  },
  disconnect(token: string) {
    return skRequest<SiteKitStatus>("/admin/site-kit/disconnect", token, {
      method: "POST",
    });
  },
  updateSettings(
    token: string,
    body: Partial<{
      propertyId: string;
      siteUrl: string;
      adsenseConnected: boolean;
      modules: Partial<SiteKitStatus["modules"]>;
    }>,
  ) {
    return skRequest<SiteKitStatus>("/admin/site-kit/settings", token, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },
  dashboard(token: string, days = 28) {
    return skRequest<SiteKitDashboard>(`/admin/site-kit/dashboard?days=${days}`, token);
  },
};
