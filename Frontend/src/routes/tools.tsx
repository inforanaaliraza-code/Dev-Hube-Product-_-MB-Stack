import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { Search } from "lucide-react";
import { tools, categories, type ToolCategory } from "@/lib/tools";
import { ToolCard } from "@/components/tool-card";
import { cn } from "@/lib/utils";

type ToolsSearch = { category?: ToolCategory };

export const Route = createFileRoute("/tools")({
  validateSearch: (s: Record<string, unknown>): ToolsSearch => ({
    category: (s.category as ToolCategory) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "All tools — devhub" },
      {
        name: "description",
        content: `Browse ${tools.length}+ utilities: temp mail, QR codes, PDF tools, AI generators, SEO and developer tools.`,
      },
      { property: "og:title", content: "All tools — devhub" },
      { property: "og:url", content: "/tools" },
    ],
    links: [{ rel: "canonical", href: "/tools" }],
  }),
  component: ToolsPage,
});

function ToolsPage() {
  const { category } = Route.useSearch();
  const [active, setActive] = useState<ToolCategory | "All">(category ?? "All");
  const [q, setQ] = useState("");

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
        <div className="glass-solid shadow-card rounded-2xl p-3 flex flex-col sm:flex-row gap-3 items-stretch border border-border">
          <div className="flex items-center gap-2 flex-1 px-3 h-10 rounded-lg bg-background border border-border">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search tools…"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(["All", ...categories] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setActive(c)}
                className={cn(
                  "text-xs px-3 h-10 rounded-lg font-medium transition-colors duration-150",
                  active === c
                    ? "bg-gradient-to-br from-aurora-1 to-aurora-3 text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
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
