"use client";

import dynamic from "next/dynamic";

const ToolsGallerySection = dynamic(
  () =>
    import("@/components/tools-gallery-section").then((mod) => ({
      default: mod.ToolsGallerySection,
    })),
  {
    ssr: false,
    loading: () => (
      <section
        id="tool-gallery"
        className="relative mx-auto max-w-7xl px-4 py-24 min-h-[320px] flex items-center justify-center text-sm text-muted-foreground"
      >
        Loading gallery…
      </section>
    ),
  },
);

export function HomeGallerySection() {
  return <ToolsGallerySection />;
}
