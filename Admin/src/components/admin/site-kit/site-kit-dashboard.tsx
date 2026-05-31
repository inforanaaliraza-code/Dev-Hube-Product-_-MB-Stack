"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  FileText,
  Gauge,
  LogOut,
  RefreshCw,
  Settings2,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { siteKitApi, type SiteKitDashboard } from "@/lib/site-kit-api";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils";

type Tab = "traffic" | "content" | "speed" | "monetization";

const TABS: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
  { id: "traffic", label: "Traffic", icon: BarChart3 },
  { id: "content", label: "Content", icon: FileText },
  { id: "speed", label: "Speed", icon: Gauge },
  { id: "monetization", label: "Monetization", icon: TrendingUp },
];

export function SiteKitDashboard() {
  const token = useAppSelector((s) => s.auth.accessToken);
  const [tab, setTab] = useState<Tab>("traffic");
  const [days, setDays] = useState(28);
  const [data, setData] = useState<SiteKitDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [propertyId, setPropertyId] = useState("");
  const [showSetup, setShowSetup] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const dash = await siteKitApi.dashboard(token, days);
      setData(dash);
      setPropertyId(dash.status.propertyId ?? "");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load Site Kit");
    } finally {
      setLoading(false);
    }
  }, [token, days]);

  useEffect(() => {
    load();
  }, [load]);

  const onConnect = async () => {
    if (!token) return;
    setConnecting(true);
    try {
      const { url } = await siteKitApi.oauthUrl(token);
      window.location.href = url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "OAuth not configured");
      setConnecting(false);
    }
  };

  const onDisconnect = async () => {
    if (!token) return;
    if (!confirm("Disconnect Google Site Kit?")) return;
    try {
      await siteKitApi.disconnect(token);
      toast.success("Disconnected");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Disconnect failed");
    }
  };

  const onSaveProperty = async () => {
    if (!token) return;
    try {
      await siteKitApi.updateSettings(token, { propertyId: propertyId.trim() });
      toast.success("GA4 property saved");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  };

  if (loading && !data) {
    return <div className="site-kit-shell p-8 text-sm text-[#5f6368]">Loading Site Kit…</div>;
  }

  const status = data?.status;
  const connected = status?.connected;

  return (
    <div className="site-kit-shell">
      <header className="sk-header">
        <div className="sk-brand">
          <span className="sk-google">Google</span>
          <span className="sk-title">Site Kit</span>
        </div>
        <div className="sk-header-actions">
          <select
            className="sk-select"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={28}>Last 28 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button type="button" className="sk-icon-btn" onClick={() => load()} title="Refresh">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </button>
          <button
            type="button"
            className="sk-icon-btn"
            onClick={() => setShowSetup((v) => !v)}
            title="Settings"
          >
            <Settings2 className="h-4 w-4" />
          </button>
          {connected ? (
            <button type="button" className="sk-text-btn" onClick={onDisconnect}>
              <LogOut className="h-4 w-4" />
              Disconnect
            </button>
          ) : (
            <button
              type="button"
              className="sk-primary-btn"
              onClick={onConnect}
              disabled={connecting}
            >
              {connecting ? "Redirecting…" : "Sign in with Google"}
            </button>
          )}
        </div>
      </header>

      {showSetup ? (
        <div className="sk-setup-card">
          <h3>Site Kit setup</h3>
          <p className="sk-muted">
            {status?.oauthConfigured
              ? `Connected as ${status.email ?? "—"}. Add your GA4 property ID (numeric, e.g. 123456789).`
              : "Add GOOGLE_SITE_KIT_CLIENT_ID, GOOGLE_SITE_KIT_CLIENT_SECRET, and GOOGLE_SITE_KIT_REDIRECT_URI to Backend .env. PageSpeed uses GOOGLE_PAGESPEED_API_KEY."}
          </p>
          <div className="flex flex-wrap gap-2 items-end mt-3">
            <div>
              <label className="sk-label">GA4 Property ID</label>
              <input
                className="sk-input"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                placeholder="123456789"
              />
            </div>
            <button type="button" className="sk-primary-btn" onClick={onSaveProperty}>
              Save property
            </button>
          </div>
          <div className="sk-module-toggles mt-4">
            {(["analytics", "searchConsole", "pagespeed", "adsense"] as const).map((key) => (
              <label key={key} className="sk-check">
                <input
                  type="checkbox"
                  checked={status?.modules[key] ?? false}
                  onChange={async (e) => {
                    if (!token) return;
                    await siteKitApi.updateSettings(token, {
                      modules: { [key]: e.target.checked },
                    });
                    await load();
                  }}
                />
                {key}
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {!connected ? (
        <div className="sk-promo-card">
          <div>
            <h2>Connect Google services to Dev Hube</h2>
            <p>
              View traffic, content performance, PageSpeed scores, and monetization insights in one
              dashboard — similar to WordPress Site Kit.
            </p>
            <div className="flex gap-2 mt-4">
              <button type="button" className="sk-primary-btn" onClick={onConnect} disabled={connecting}>
                Set up Site Kit
              </button>
              <Link href="/plugins" className="sk-secondary-btn">
                Back to plugins
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <nav className="sk-tabs">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={cn("sk-tab", tab === id && "sk-tab-active")}
            onClick={() => setTab(id)}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>

      {data ? (
        <>
          {tab === "traffic" ? (
            <section className="sk-panel">
              <h2>Find out how your audience is growing</h2>
              <p className="sk-muted">Track your site&apos;s traffic over time.</p>
              <div className="sk-grid-2">
                <div className="sk-metric-card">
                  <span className="sk-label">All visitors</span>
                  <div className="sk-big-metric">{data.traffic.totalUsers}</div>
                  <span
                    className={cn(
                      "sk-change",
                      data.traffic.changePercent >= 0 ? "sk-up" : "sk-down",
                    )}
                  >
                    {data.traffic.changePercent >= 0 ? "↑" : "↓"}{" "}
                    {Math.abs(data.traffic.changePercent)}% vs previous period
                  </span>
                  <p className="sk-source">
                    Source:{" "}
                    {data.traffic.source === "google_analytics"
                      ? "Google Analytics"
                      : "Site activity (QR scans)"}
                  </p>
                  <div className="sk-sparkline">
                    {data.traffic.series.map((p) => (
                      <div
                        key={p.date}
                        className="sk-bar"
                        style={{
                          height: `${Math.max(8, (p.users / Math.max(1, ...data.traffic.series.map((s) => s.users))) * 100)}%`,
                        }}
                        title={`${p.date}: ${p.users}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="sk-metric-card">
                  <span className="sk-label">Channels</span>
                  <ul className="sk-channel-list">
                    {data.traffic.channels.map((c) => (
                      <li key={c.label}>
                        <span>{c.label}</span>
                        <strong>{c.percent}%</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          ) : null}

          {tab === "content" ? (
            <section className="sk-panel">
              <h2>Content on your site</h2>
              <div className="sk-stat-row">
                <div className="sk-stat-box">
                  <strong>{data.content.publishedPosts}</strong>
                  <span>Published posts</span>
                </div>
                <div className="sk-stat-box">
                  <strong>{data.content.publishedPages}</strong>
                  <span>Published pages</span>
                </div>
                <div className="sk-stat-box">
                  <strong>{data.content.liveTools}</strong>
                  <span>Live tools</span>
                </div>
              </div>
              <table className="sk-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.topItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.title}</td>
                      <td>{item.type}</td>
                      <td>{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ) : null}

          {tab === "speed" ? (
            <section className="sk-panel">
              <h2>Site speed</h2>
              {!data.speed.enabled ? (
                <p className="sk-muted">Enable PageSpeed module in settings.</p>
              ) : !data.speed.configured ? (
                <p className="sk-muted">Set GOOGLE_PAGESPEED_API_KEY in Backend .env</p>
              ) : (
                <div className="sk-grid-2">
                  {(["mobile", "desktop"] as const).map((key) => {
                    const row = data.speed[key];
                    return (
                      <div key={key} className="sk-metric-card">
                        <span className="sk-label capitalize">{key}</span>
                        <div className="sk-score">{row?.score ?? "—"}</div>
                        <ul className="sk-speed-audits">
                          <li>FCP: {row?.fcp}</li>
                          <li>LCP: {row?.lcp}</li>
                          <li>TBT: {row?.tbt}</li>
                          <li>CLS: {row?.cls}</li>
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          ) : null}

          {tab === "monetization" ? (
            <section className="sk-panel">
              <h2>Monetization</h2>
              <p className="sk-muted">{data.monetization.message}</p>
              <div className="sk-promo-card sk-promo-inline">
                <div>
                  <h3>Get better quality leads with Google Ads</h3>
                  <p>Promote Dev Hube tools to developers searching on Google.</p>
                </div>
                <button
                  type="button"
                  className="sk-primary-btn"
                  onClick={async () => {
                    if (!token) return;
                    await siteKitApi.updateSettings(token, { adsenseConnected: true });
                    toast.success("AdSense marked as connected");
                    await load();
                  }}
                >
                  Set up Ads
                </button>
              </div>
              {data.searchConsole.enabled ? (
                <div className="sk-stat-row mt-4">
                  <div className="sk-stat-box">
                    <strong>{data.searchConsole.clicks}</strong>
                    <span>Clicks</span>
                  </div>
                  <div className="sk-stat-box">
                    <strong>{data.searchConsole.impressions}</strong>
                    <span>Impressions</span>
                  </div>
                  <div className="sk-stat-box">
                    <strong>{data.searchConsole.ctr}%</strong>
                    <span>CTR</span>
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
