import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Zap, Lock, Layers } from "lucide-react";
import { Hero } from "@/components/hero";
import { ToolCard } from "@/components/tool-card";
import { ToolMarquee } from "@/components/tool-marquee";
import { StatsStrip } from "@/components/stats-strip";
import { tools, categories, featuredTools, categoryCounts } from "@/lib/tools";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "devhub — The developer's utility hub" },
      {
        name: "description",
        content: `Temp mail, QR codes, PDF tools, AI utilities and more. ${tools.length}+ tools in one premium hub.`,
      },
      { property: "og:title", content: "devhub — The developer's utility hub" },
      {
        property: "og:description",
        content: `${tools.length}+ developer utilities in one premium, lightning-fast hub.`,
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const features = [
  {
    icon: Zap,
    title: "Instant, in-browser",
    body: "Every tool runs client-side where possible. No round-trips, no waiting.",
  },
  {
    icon: Lock,
    title: "Private by default",
    body: "Your data never leaves your device for local utilities. Period.",
  },
  {
    icon: Layers,
    title: "One consistent UI",
    body: "Stop juggling 12 sketchy sites. Everything lives under one roof.",
  },
];

function Index() {
  return (
    <>
      <Hero />
      <ToolMarquee />
      <StatsStrip />

      <section id="tools" className="relative mx-auto max-w-7xl px-4 py-24">
        <div className="flex items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
              Featured
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold">
              Trending tools.
            </h2>
          </div>
          <Link
            to="/tools"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredTools.slice(0, 9).map((t) => (
            <ToolCard key={t.slug} tool={t} />
          ))}
        </div>
      </section>

      <section id="categories" className="relative mx-auto max-w-7xl px-4 py-16">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
            Categories
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold">
            Browse by what you need.
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {categories.map((c) => (
            <Link
              key={c}
              to="/tools"
              search={{ category: c } as never}
              className="block p-5 rounded-2xl glass-solid shadow-card hover:-translate-y-1 transition-transform duration-150 border border-border group"
            >
              <p className="font-display font-semibold mb-1 group-hover:text-gradient">
                {c}
              </p>
              <p className="text-xs text-muted-foreground">
                {categoryCounts[c]} tools
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="p-6 rounded-2xl glass-solid shadow-card border border-border"
              >
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-aurora-1 to-aurora-2 grid place-items-center mb-4">
                  <Icon className="h-4 w-4 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-1.5">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative mx-auto max-w-5xl px-4 py-24">
        <div className="relative overflow-hidden rounded-3xl glass-solid shadow-card p-10 sm:p-16 text-center border border-border">
          <h2 className="font-display text-3xl sm:text-5xl font-semibold tracking-tight">
            Ship faster. <span className="text-gradient">Today.</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-md mx-auto">
            Bookmark devhub. The next time you need a quick utility, it&apos;ll be one tab
            away.
          </p>
          <Link
            to="/tools"
            className="mt-8 inline-flex items-center gap-2 h-12 px-7 rounded-xl btn-primary font-medium text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform duration-150"
          >
            Open the hub <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
