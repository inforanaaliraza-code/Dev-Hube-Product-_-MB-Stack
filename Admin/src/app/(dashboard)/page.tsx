"use client";

import { useEffect } from "react";
import Link from "next/link";
import { WpPageHeader } from "@/components/admin/wp-page-header";
import { WpPostbox } from "@/components/admin/wp-postbox";
import { Badge } from "@/components/ui/badge";
import { fetchCategories } from "@/store/slices/settingsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.accessToken);
  const tools = useAppSelector((s) => s.toolsAdmin.items);
  const categories = useAppSelector((s) => s.settings.categories);
  const loading = useAppSelector((s) => s.toolsAdmin.loading);
  const site = useAppSelector((s) => s.settings.site);

  useEffect(() => {
    if (!token) return;
    dispatch(fetchCategories(token));
  }, [token, dispatch]);

  const ready = tools.filter((t) => t.status === "ready").length;
  const featured = tools.filter((t) => t.featured).length;
  const soon = tools.filter((t) => t.status === "soon").length;

  return (
    <>
      <WpPageHeader title="Dashboard" />
      <div className="wp-notice wp-notice-warning">
        Manage the public site from this panel. Changes to settings and tools sync to the frontend API.
      </div>
      <div className="wp-dashboard-widgets">
        <WpPostbox title="At a Glance">
          <p>
            <strong>{loading ? "…" : tools.length}</strong> tools ·{" "}
            <strong>{ready}</strong> live · <strong>{soon}</strong> coming soon ·{" "}
            <strong>{categories?.categories.length ?? "…"}</strong> categories
          </p>
          <p className="mt-2">
            <Link href="/tools/new" className="wp-button-primary">
              Add tool
            </Link>
          </p>
        </WpPostbox>
        <WpPostbox title="Site Health">
          <p>
            <strong className="text-emerald-400">Good</strong> — Backend connected. Public URL:{" "}
            <a href={site.publicSiteUrl} target="_blank" rel="noreferrer">
              {site.publicSiteUrl}
            </a>
          </p>
          {site.maintenanceMode ? (
            <p className="mt-2 text-destructive">Maintenance mode is ON (visitors see a notice).</p>
          ) : null}
        </WpPostbox>
        <WpPostbox title="Quick Draft" className="wp-postbox-wide">
          <p className="text-muted-foreground mb-3">Jump to common admin tasks.</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/tools/new" className="wp-button-primary">
              New tool
            </Link>
            <Link href="/tools" className="wp-button-secondary">
              All tools
            </Link>
            <Link href="/categories" className="wp-button-secondary">
              Categories
            </Link>
            <Link href="/gallery" className="wp-button-secondary">
              Gallery
            </Link>
            <Link href="/settings/general" className="wp-button-secondary">
              Settings
            </Link>
          </div>
        </WpPostbox>
        <WpPostbox title="Recent Tools" className="wp-postbox-wide">
          <table className="wp-list-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tools.slice(0, 10).map((t) => (
                <tr key={t.slug}>
                  <td>
                    <Link href={`/tools/${t.slug}`}>{t.name}</Link>
                  </td>
                  <td>{t.category}</td>
                  <td>
                    <Badge variant={t.status === "ready" ? "success" : "warning"}>{t.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-muted-foreground">
            {featured} featured tools on homepage.
          </p>
        </WpPostbox>
      </div>
    </>
  );
}
