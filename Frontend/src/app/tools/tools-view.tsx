"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Fuse from "fuse.js";
import { LayoutGrid, Search } from "lucide-react";
import { tools } from "@/lib/tools";
import { TOOL_NAV_ROOTS, getSlugsForNavRoot } from "@/lib/tool-nav";
import { TOOL_NAV_ICON_MAP } from "@/lib/tool-visuals";
import { ToolCard } from "@/components/tool-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setActiveNav,
  setSearchQuery,
  type NavFilter,
} from "@/store/slices/toolsSlice";

function parseNav(value: string | undefined): NavFilter {
  if (!value) return "All";
  return TOOL_NAV_ROOTS.some((r) => r.id === value) ? value : "All";
}

export function ToolsView({
  initialNav,
}: {
  initialCategory?: string;
  initialNav?: string;
}) {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const activeNav = useAppSelector((s) => s.tools.activeNav);
  const q = useAppSelector((s) => s.tools.searchQuery);

  useEffect(() => {
    dispatch(setActiveNav(parseNav(initialNav)));
  }, [initialNav, dispatch]);

  useEffect(() => {
    dispatch(setActiveNav(parseNav(searchParams.get("nav") ?? undefined)));
  }, [searchParams, dispatch]);

  const fuse = useMemo(
    () =>
      new Fuse(tools, {
        keys: ["name", "tagline", "category", "keywords"],
        threshold: 0.35,
      }),
    [],
  );

  const list = useMemo(() => {
    let pool = tools;
    if (activeNav !== "All") {
      const slugs = new Set(getSlugsForNavRoot(activeNav));
      pool = pool.filter((t) => slugs.has(t.slug));
    }
    if (q.trim()) {
      const found = new Set(fuse.search(q).map((r) => r.item.slug));
      pool = pool.filter((t) => found.has(t.slug));
    }
    return pool;
  }, [activeNav, q, fuse]);

  return (
    <div className="relative pt-32 pb-24 mx-auto max-w-7xl px-4">
      <header className="text-center mb-10">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">
          Developer tools
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">
          Every tool, <span className="text-gradient">one place.</span>
        </h1>
        <p className="mt-3 text-muted-foreground max-w-lg mx-auto text-sm sm:text-base">
          {tools.length} professional utilities for encoding, code, JSON/XML, security and more.
        </p>
      </header>

      <div className="sticky top-[4.5rem] z-30 mb-8">
        <Card className="glass-solid shadow-card rounded-2xl p-3 border-border/70">
          <div className="flex items-center gap-2 rounded-xl bg-secondary/25 border border-border/50 px-3 h-11 mb-3">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              value={q}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              placeholder="Search tools…"
              className="flex-1 border-0 shadow-none focus-visible:ring-0 h-9 bg-transparent text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(["All", ...TOOL_NAV_ROOTS.map((r) => r.id)] as const).map((n) => {
              const root = n === "All" ? null : TOOL_NAV_ROOTS.find((r) => r.id === n);
              const label = n === "All" ? "All tools" : (root?.label ?? n);
              const selected = activeNav === n;
              const Icon = n === "All" ? LayoutGrid : root ? TOOL_NAV_ICON_MAP[root.icon] : LayoutGrid;
              return (
                <Button
                  key={n}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => dispatch(setActiveNav(n))}
                  className={cn(
                    "h-9 gap-1.5 text-xs font-medium border border-transparent",
                    selected &&
                      "bg-secondary/80 text-foreground border-border/80 shadow-sm",
                    !selected && "text-muted-foreground hover:text-foreground hover:bg-secondary/40",
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{n === "All" ? "All" : root?.label.split(" ")[0]}</span>
                </Button>
              );
            })}
          </div>
        </Card>
      </div>

      {list.length === 0 ? (
        <p className="text-center text-muted-foreground py-24">
          No tools match your filters.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 tools-grid">
          {list.map((t) => (
            <ToolCard key={t.slug} tool={t} />
          ))}
        </div>
      )}
    </div>
  );
}
