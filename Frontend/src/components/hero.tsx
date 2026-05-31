"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/use-site-settings";

const chips = [
  { label: "{ json }", className: "left-[5%] top-[18%]" },
  { label: "JWT.eyJ", className: "left-[3%] top-[46%]" },
  { label: "base64", className: "left-[8%] top-[72%]" },
  { label: "/regex/g", className: "right-[7%] top-[24%]" },
  { label: "POST /api", className: "right-[5%] top-[50%]" },
  { label: "uuid v7", className: "right-[9%] top-[74%]" },
];

export function Hero() {
  const { settings } = useSiteSettings();

  return (
    <section className="relative flex flex-1 flex-col justify-center overflow-hidden fade-in py-6 sm:py-8">
      <div
        aria-hidden
        className="absolute inset-0 grid-bg pointer-events-none opacity-90"
      />
      <div
        aria-hidden
        className="absolute -top-20 -left-16 w-[340px] h-[340px] rounded-full blur-3xl pointer-events-none hero-mesh-purple opacity-80"
      />
      <div
        aria-hidden
        className="absolute -top-12 -right-12 w-[300px] h-[300px] rounded-full blur-3xl pointer-events-none hero-mesh-pink opacity-70"
      />
      <div
        aria-hidden
        className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[440px] h-[260px] rounded-full blur-3xl pointer-events-none hero-mesh-teal opacity-60"
      />

      <div className="hidden lg:block absolute inset-0 pointer-events-none max-w-6xl mx-auto">
        {chips.map((c) => (
          <Badge
            key={c.label}
            variant="outline"
            className={`absolute font-mono text-[11px] chip-float ${c.className}`}
          >
            {c.label}
          </Badge>
        ))}
      </div>

      <div className="relative mx-auto max-w-3xl px-4 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
          {settings.tagline}
        </p>
        <h1 className="font-display text-[2.35rem] sm:text-5xl md:text-[3.25rem] font-semibold leading-[1.05] tracking-tight text-foreground">
          {settings.heroTitle || "Build faster with"}
          <br />
          <span className="text-gradient">utility</span> hub.
        </h1>

        <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
          {settings.heroSubtitle}
        </p>

        <div className="mt-6 flex flex-wrap gap-2.5 justify-center">
          <Button variant="aurora" size="lg" asChild>
            <Link href="/tools" className="group">
              Explore tools
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </Button>
          <Button variant="glass" size="lg" asChild>
            <a href="#categories">Browse categories</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
