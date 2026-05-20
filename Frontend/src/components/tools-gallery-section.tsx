"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GalleryItem } from "@/lib/gallery-items";
import { getToolsForGallery } from "@/lib/gallery-items";
import { buildToolsGalleryItems } from "@/lib/tool-gallery-canvas";
import { tools } from "@/lib/tools";
import { useTheme } from "@/hooks/use-theme";

const CircularGallery = dynamic(() => import("@/components/circular-gallery/CircularGallery"), {
  ssr: false,
});

export function ToolsGallerySection() {
  const { theme } = useTheme();
  const textColor = theme === "dark" ? "#fafafa" : "#171717";
  const galleryTools = useMemo(() => getToolsForGallery(tools), []);
  const [items, setItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    buildToolsGalleryItems(galleryTools).then((built) => {
      if (!cancelled) setItems(built);
    });
    return () => {
      cancelled = true;
    };
  }, [galleryTools]);

  return (
    <section id="tool-gallery" className="relative mx-auto max-w-7xl px-4 py-24">
      <header className="mb-10 text-center max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
          Full catalog
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-semibold">
          Scroll through <span className="text-gradient">every tool.</span>
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Auto-scrolls left to right — drag or scroll to browse {galleryTools.length} tools.
        </p>
      </header>
      <div
        className="relative w-full rounded-3xl overflow-hidden border border-border glass-solid shadow-card"
        style={{ height: "min(600px, 70vh)" }}
      >
        {items.length > 0 ? (
          <CircularGallery
            items={items}
            bend={1}
            borderRadius={0.05}
            scrollSpeed={2}
            scrollEase={0.05}
            textColor={textColor}
            font='bold 30px "Space Grotesk", system-ui, sans-serif'
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Loading gallery…
          </div>
        )}
      </div>
      <div className="mt-8 flex justify-center">
        <Button variant="glass" size="lg" asChild>
          <Link href="/tools">
            Open tools directory
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
