"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { WP_MENU, isMenuActive, isSubActive } from "@/lib/wp-menu";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";

export function WpSidebar({
  collapsed,
  onCollapse,
  mobileOpen,
  onMobileClose,
}: {
  collapsed: boolean;
  onCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const pathname = usePathname();
  const tools = useAppSelector((s) => s.toolsAdmin.items);
  const readyCount = tools.filter((t) => t.status === "ready").length;
  const soonCount = tools.filter((t) => t.status === "soon").length;

  const badgeFor = (id: string) => {
    if (id === "tools" && soonCount > 0) return soonCount;
    return undefined;
  };

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="wp-sidebar-backdrop"
          aria-label="Close menu"
          onClick={onMobileClose}
        />
      ) : null}
      <aside
        className={cn(
          "wp-sidebar flex flex-col",
          collapsed && "wp-sidebar-collapsed",
          mobileOpen && "wp-sidebar-mobile-open",
        )}
      >
        <div className="wp-sidebar-brand">
          <BrandLogo variant="sidebar" />
        </div>
        <ul className="wp-menu">
          {WP_MENU.map((item) => {
            const Icon = item.icon;
            const active = isMenuActive(pathname, item);
            const badge = badgeFor(item.id) ?? item.badge;
            const hasSub = Boolean(item.submenu?.length);
            return (
              <li
                key={item.id}
                className={cn(
                  "wp-menu-item",
                  active && "wp-menu-item-active",
                  hasSub && "wp-has-submenu",
                )}
              >
                <Link
                  href={item.href}
                  className="wp-menu-link"
                  onClick={onMobileClose}
                >
                  <Icon className="wp-menu-icon" />
                  <span className="wp-menu-text">{item.label}</span>
                  {badge ? <span className="wp-menu-badge">{badge}</span> : null}
                </Link>
                {hasSub && !collapsed ? (
                  <div className="wp-submenu-flyout">
                    <ul>
                      {item.submenu!.map((sub) => (
                        <li key={sub.href}>
                          <Link
                            href={sub.href}
                            className={cn(
                              isSubActive(pathname, sub.href) && "wp-submenu-item-active",
                            )}
                            onClick={onMobileClose}
                          >
                            {sub.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
        <button type="button" className="wp-collapse-btn" onClick={onCollapse}>
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          <span className="wp-collapse-label">{collapsed ? "Expand" : "Collapse menu"}</span>
        </button>
        <div className="wp-sidebar-footer">
          <span className="wp-stat-pill">{readyCount} live</span>
          <span className="ml-2 text-muted-foreground">AI workflow hub</span>
        </div>
      </aside>
    </>
  );
}
