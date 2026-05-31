"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ToolIcon } from "@/components/tool-icon";
import { TOOL_NAV_ROOTS } from "@/lib/tool-nav";
import { TOOL_ACCENT_ICON, TOOL_ACCENT_RING, TOOL_NAV_ICON_MAP } from "@/lib/tool-visuals";
import { getToolBySlug } from "@/lib/tools";
import { cn } from "@/lib/utils";

function NavCategoryIcon({ icon }: { icon: keyof typeof TOOL_NAV_ICON_MAP }) {
  const Icon = TOOL_NAV_ICON_MAP[icon];
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/70 bg-secondary/40">
      <Icon className="h-3.5 w-3.5 text-foreground/85" strokeWidth={2} />
    </span>
  );
}

export function ToolsNavMenu() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-0.5 min-w-0">
      {TOOL_NAV_ROOTS.map((root) => {
        const open = openId === root.id;
        return (
          <div
            key={root.id}
            className="relative shrink-0"
            onMouseEnter={() => setOpenId(root.id)}
            onMouseLeave={() => setOpenId(null)}
          >
            <Link
              href={`/tools?nav=${root.id}`}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1.5 text-[13px] rounded-lg transition-colors",
                open
                  ? "text-foreground bg-secondary/70"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/45",
              )}
            >
              <NavCategoryIcon icon={root.icon} />
              <span className="whitespace-nowrap hidden xl:inline">{root.label}</span>
              <ChevronDown
                className={cn("h-3 w-3 opacity-50 transition-transform", open && "rotate-180")}
              />
            </Link>

            {open ? (
              <div className="tools-nav-panel absolute left-0 top-full pt-2 z-[60]">
                <div
                  className={cn(
                    "rounded-xl border border-border/80 bg-popover/98 backdrop-blur-xl shadow-2xl p-4",
                    root.sections.length > 1 ? "min-w-[520px]" : "min-w-[300px]",
                  )}
                >
                  <div
                    className={cn(
                      "grid gap-4",
                      root.sections.length > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1",
                    )}
                  >
                    {root.sections.map((section) => (
                      <div key={section.title}>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2 px-1">
                          {section.title}
                        </p>
                        <ul className="space-y-0.5">
                          {section.items.map((item) => {
                            const tool = getToolBySlug(item.slug);
                            if (!tool || tool.status !== "ready") return null;
                            const label = item.label ?? tool.name;
                            return (
                              <li key={`${section.title}-${item.slug}`}>
                                <Link
                                  href={`/tools/${item.slug}`}
                                  className="tools-nav-item group flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-foreground/90 hover:bg-secondary/60 hover:text-foreground transition-colors"
                                >
                                  <span
                                    className={cn(
                                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
                                      TOOL_ACCENT_RING[tool.accent],
                                    )}
                                  >
                                    <ToolIcon
                                      name={tool.icon}
                                      className={cn("h-4 w-4", TOOL_ACCENT_ICON[tool.accent])}
                                    />
                                  </span>
                                  <span className="leading-tight">{label}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function ToolsNavMobileLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="space-y-1 border-t border-border pt-3 mt-2">
      <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Tool categories
      </p>
      {TOOL_NAV_ROOTS.map((root) => (
        <div key={root.id} className="px-1">
          <Link
            href={`/tools?nav=${root.id}`}
            onClick={onNavigate}
            className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm font-medium hover:bg-secondary/60"
          >
            <NavCategoryIcon icon={root.icon} />
            {root.label}
          </Link>
        </div>
      ))}
    </div>
  );
}
