import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { glassCard } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";
import { Hero } from "@/components/hero";
import { HomeGallerySection } from "@/components/home-gallery-section";
import { HomeFeatures } from "@/components/home-features";
import { ToolCard } from "@/components/tool-card";
import { ToolMarquee } from "@/components/tool-marquee";
import { StatsStrip } from "@/components/stats-strip";
import { tools, categories, featuredTools, categoryCounts } from "@/lib/tools";

export const metadata: Metadata = {
  title: "The developer's utility hub",
  description: `Temp mail, QR codes, PDF tools, AI utilities and more. ${tools.length}+ tools in one premium hub.`,
  openGraph: {
    title: "Dev Hube — The developer's utility hub",
    description: `${tools.length}+ developer utilities in one premium, lightning-fast hub.`,
    url: "/",
  },
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return (
    <>
      <section className="home-viewport flex flex-col">
        <Hero />
        <StatsStrip variant="landing" />
        <div className="mt-auto">
          <ToolMarquee />
        </div>
      </section>

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
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
            <Link href="/tools">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredTools.slice(0, 9).map((t) => (
            <ToolCard key={t.slug} tool={t} />
          ))}
        </div>
      </section>

      <HomeGallerySection />

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
              href={`/tools?category=${encodeURIComponent(c)}`}
              className="block group"
            >
              <Card
                className={cn(
                  glassCard,
                  "p-5 hover:-translate-y-1 transition-transform duration-150",
                )}
              >
                <CardContent className="p-0">
                  <p className="font-display font-semibold mb-1 group-hover:text-gradient">
                    {c}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {categoryCounts[c]} tools
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <HomeFeatures />

      <section className="relative mx-auto max-w-5xl px-4 py-24">
        <Card className={cn(glassCard, "relative overflow-hidden rounded-3xl p-10 sm:p-16 text-center")}>
          <CardContent className="p-0">
            <h2 className="font-display text-3xl sm:text-5xl font-semibold tracking-tight">
              Ship faster. <span className="text-gradient">Today.</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-md mx-auto">
              Bookmark Dev Hube. The next time you need a quick utility, it&apos;ll be one tab
              away.
            </p>
            <Button variant="aurora" size="lg" className="mt-8" asChild>
              <Link href="/tools">
                Open the hub <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
