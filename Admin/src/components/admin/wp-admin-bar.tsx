"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Menu, Plus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";

export function WpAdminBar({
  onMenuToggle,
  sidebarCollapsed,
}: {
  onMenuToggle: () => void;
  sidebarCollapsed: boolean;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const email = useAppSelector((s) => s.auth.email);
  const siteName = useAppSelector((s) => s.settings.site.siteName);
  const siteUrl = useAppSelector((s) => s.settings.site.publicSiteUrl);

  return (
    <header id="wpadminbar" className="wp-admin-bar">
      <div className="wp-admin-bar-inner">
        <div className="wp-admin-bar-left">
          <button
            type="button"
            className="wp-ab-item wp-ab-mobile"
            onClick={onMenuToggle}
            aria-label="Menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <Link href="/" className="wp-ab-item wp-ab-site text-gradient">
            {siteName || "Dev Hube"}
          </Link>
          <span className="wp-ab-sep" />
          <Link href={siteUrl} target="_blank" rel="noopener noreferrer" className="wp-ab-item">
            <ExternalLink className="h-3.5 w-3.5 inline mr-1" />
            Visit Site
          </Link>
          <span className="wp-ab-sep" />
          <div className="wp-ab-submenu-wrap">
            <span className="wp-ab-item wp-ab-submenu-trigger">
              <Plus className="h-3.5 w-3.5 inline mr-1" />
              New
            </span>
            <div className="wp-ab-submenu">
              <Link href="/tools/new" className="wp-ab-submenu-item">
                Tool
              </Link>
              <Link href="/posts/new" className="wp-ab-submenu-item">
                Blog Post
              </Link>
              <Link href="/pages/new" className="wp-ab-submenu-item">
                Page
              </Link>
              <Link href="/media" className="wp-ab-submenu-item">
                Media
              </Link>
            </div>
          </div>
        </div>
        <div className="wp-admin-bar-right">
          <span className="wp-ab-item hidden sm:inline">Howdy, {email ?? "admin"}</span>
          <button
            type="button"
            className="wp-ab-item"
            onClick={() => {
              dispatch(logout());
              router.replace("/login");
            }}
          >
            Log out
          </button>
        </div>
      </div>
      {sidebarCollapsed ? null : (
        <span className="sr-only">Sidebar expanded</span>
      )}
    </header>
  );
}
