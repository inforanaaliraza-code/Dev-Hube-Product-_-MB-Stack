"use client";

import { useState, type ReactNode } from "react";
import { WpAdminBar } from "@/components/admin/wp-admin-bar";
import { WpSidebar } from "@/components/admin/wp-sidebar";

export function WpShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="wp-admin">
      <WpAdminBar
        sidebarCollapsed={collapsed}
        onMenuToggle={() => setMobileOpen((v) => !v)}
      />
      <div className="wp-body">
        <WpSidebar
          collapsed={collapsed}
          onCollapse={() => setCollapsed((v) => !v)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <div id="wpcontent" className={cnContent(collapsed)}>
          <div id="wpbody" role="main">
            <div id="wpbody-content">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cnContent(collapsed: boolean) {
  return `wp-content${collapsed ? " wp-content-collapsed" : ""}`;
}
