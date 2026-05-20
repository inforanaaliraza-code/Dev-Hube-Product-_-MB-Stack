"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Fuse from "fuse.js";
import { Search } from "lucide-react";
import { tools, categories, type ToolCategory, categoryCounts } from "@/lib/tools";
import { ToolCard } from "@/components/tool-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setActiveCategory,
  setSearchQuery,
  type CategoryFilter,
} from "@/store/slices/toolsSlice";

function parseCategory(value: string | undefined): CategoryFilter {
  if (!value) return "All";
  if ((categories as readonly string[]).includes(value)) {
    return value as ToolCategory;
  }
  return "All";
}

export function ToolsView({ initialCategory }: { initialCategory?: string }) {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const active = useAppSelector((s) => s.tools.activeCategory);
  const q = useAppSelector((s) => s.tools.searchQuery);

  useEffect(() => {
    dispatch(setActiveCategory(parseCategory(initialCategory)));
  }, [initialCategory, dispatch]);

  useEffect(() => {
    dispatch(setActiveCategory(parseCategory(searchParams.get("category") ?? undefined)));
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
    if (active !== "All") pool = pool.filter((t) => t.category === active);
    if (q.trim()) {
      const found = new Set(fuse.search(q).map((r) => r.item.slug));
      pool = pool.filter((t) => found.has(t.slug));
    }
    return pool;
  }, [active, q, fuse]);

  return (
    <div className="relative pt-32 pb-24 mx-auto max-w-7xl px-4">
      <header className="text-center mb-12">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">
          The hub
        </p>
        <h1 className="font-display text-4xl sm:text-6xl font-semibold tracking-tight">
          Every tool, <span className="text-gradient">one place.</span>
        </h1>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          {tools.length} utilities and counting. Click any card to open the tool.
        </p>
      </header>

      <div className="sticky top-20 z-30 mb-8">
        <Card className="glass-solid shadow-card rounded-2xl p-3 flex flex-col sm:flex-row gap-3 items-stretch border-border">
          <div className="flex items-center gap-2 flex-1 px-1">
            <Search className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
            <Input
              value={q}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              placeholder="Search tools…"
              className="flex-1 border-0 shadow-none focus-visible:ring-0 h-10 bg-transparent"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(["All", ...categories] as const).map((c) => {
              const count = c === "All" ? tools.length : categoryCounts[c];
              return (
                <Tooltip key={c}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={active === c ? "default" : "ghost"}
                      size="sm"
                      onClick={() => dispatch(setActiveCategory(c))}
                      className={cn(
                        "h-10 text-xs font-medium",
                        active === c &&
                          "bg-gradient-to-br from-aurora-1 to-aurora-3 text-primary-foreground shadow-glow border-0 hover:opacity-95",
                      )}
                    >
                      {c}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {c === "All" ? `All ${count} tools` : `${count} tools in ${c}`}
                  </TooltipContent>
                </Tooltip>
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
